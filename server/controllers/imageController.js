const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const enhanceImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucune image fournie' });
    }

    const inputPath = req.file.path;
    const ext = path.extname(req.file.originalname);
    const outputName = `enhanced-${req.file.filename}`;
    const outputPath = path.join(__dirname, '..', 'uploads', outputName);

    const metadata = await sharp(inputPath).metadata();

    let pipeline = sharp(inputPath);

    // Auto-orient based on EXIF
    pipeline = pipeline.rotate();

    // Auto-level: normalize to improve contrast/brightness
    pipeline = pipeline.normalise();

    // Sharpen with moderate amount
    pipeline = pipeline.sharpen({
      sigma: 1.2,
      flat: 1.5,
      jagged: 2.0,
    });

    // Gamma correction for better brightness
    pipeline = pipeline.gamma(1.3);

    // Resize if too large (max 1600px on longest side)
    if (metadata.width > 1600 || metadata.height > 1600) {
      pipeline = pipeline.resize({
        width: Math.min(metadata.width, 1600),
        height: Math.min(metadata.height, 1600),
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert to JPEG with quality 92
    pipeline = pipeline.jpeg({ quality: 92, mozjpeg: true });

    await pipeline.toFile(outputPath);

    const protocol = req.protocol;
    const host = req.get('host');

    res.status(200).json({
      success: true,
      data: {
        original: `${protocol}://${host}/uploads/${req.file.filename}`,
        enhanced: `${protocol}://${host}/uploads/${outputName}`,
      }
    });
  } catch (error) {
    next(error);
  }
};

const fetchOfficialCover = async (title, author, isbn) => {
  try {
    // 1. Google Books by ISBN
    if (isbn) {
      const cleanIsbn = isbn.replace(/[-\s]/g, '');
      const gBooksRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(cleanIsbn)}`);
      const gBooksData = await gBooksRes.json();
      if (gBooksData.items && gBooksData.items.length > 0) {
        const volumeInfo = gBooksData.items[0].volumeInfo;
        if (volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail) {
          return volumeInfo.imageLinks.thumbnail.replace('http://', 'https://');
        }
      }

      // 2. Open Library by ISBN
      const olRes = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${encodeURIComponent(cleanIsbn)}&format=json&jscmd=data`);
      const olData = await olRes.json();
      const olBook = olData[`ISBN:${cleanIsbn}`];
      if (olBook && olBook.cover && olBook.cover.large) {
        return olBook.cover.large;
      }
    }

    // 3. Google Books by Title and Author
    if (title) {
      let query = `intitle:${title}`;
      if (author && author.toLowerCase() !== 'inconnu') {
        query += `+inauthor:${author}`;
      }
      const gBooksRes = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
      const gBooksData = await gBooksRes.json();
      if (gBooksData.items && gBooksData.items.length > 0) {
        const volumeInfo = gBooksData.items[0].volumeInfo;
        if (volumeInfo.imageLinks && (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.medium)) {
          return (volumeInfo.imageLinks.thumbnail || volumeInfo.imageLinks.medium).replace('http://', 'https://');
        }
      }

      // 4. Open Library Search
      let olQuery = title;
      if (author && author.toLowerCase() !== 'inconnu') {
        olQuery += ` ${author}`;
      }
      const olRes = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(olQuery)}&limit=1`);
      const olData = await olRes.json();
      if (olData.docs && olData.docs.length > 0) {
        const doc = olData.docs[0];
        if (doc.cover_i) {
          return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
        }
      }
    }
  } catch (err) {
    console.error('Error fetching official cover:', err.message);
  }
  return null;
};

const callGeminiVision = async (apiKey, base64Image) => {
  const models = [
    'gemini-2.0-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-3.5-flash'
  ];

  let lastError;
  for (const model of models) {
    try {
      console.log(`   Trying Gemini model: ${model}...`);
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const prompt = `Tu es un assistant IA spécialisé dans l'analyse de livres scolaires et universitaires tunisiens. Analyse cette image de livre et retourne STRICTEMENT un objet JSON (sans markdown, sans autre texte) contenant les champs suivants :
          - "title": le titre principal du livre (ex: "Manuel d'activités : Technologie", "Mathématiques", etc.)
          - "author": l'auteur ou l'éditeur, si visible, sinon "Inconnu"
          - "isbn": le code ISBN ou code-barres, si visible, sinon "Inconnu"
          - "subject": la matière du livre, qui DOIT absolument être l'une des suivantes: ['Mathématiques', 'Physique-Chimie', 'Sciences', 'Informatique', 'Français', 'Arabe', 'Anglais', 'Histoire-Géo', 'Philosophie', 'Économie', 'Gestion', 'Technique', 'Autre']
          - "level": le niveau scolaire, qui DOIT absolument être l'un des suivants: ['Primaire — 1ère année', 'Primaire — 2ème année', 'Primaire — 3ème année', 'Primaire — 4ème année', 'Primaire — 5ème année', 'Primaire — 6ème année', 'Collège — 7ème année', 'Collège — 8ème année', 'Collège — 9ème année', 'Lycée — 1ère année', 'Lycée — 2ème année', 'Lycée — 3ème année', 'Lycée — Baccalauréat', 'Prépa', 'Universitaire', 'Autre']
          - "condition": l'état estimé du livre d'après la photo. Tu dois impérativement choisir la valeur la plus proche parmi cette liste exacte uniquement: ['Neuf', 'Bon état', 'Usagé']. Analyse les coins, les rayures, ou la couverture pour déterminer l'état.
          - "description": une courte description générée pour ce livre, avec un ton professionnel et attrayant (ex: "Manuel scolaire de mathématiques pour la 3ème année primaire, édition conforme au programme tunisien.")
          - "imagePrompt": un prompt détaillé (en anglais) pour un générateur d'images IA. Décris une belle composition professionnelle d'une couverture numérique avec le bon titre et la bonne matière, mais SANS l'arrière-plan de la table.
          
          Assure-toi de renvoyer UNIQUEMENT le JSON avec ces clés.`;

      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || `Error calling ${model}`);
      }

      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) throw new Error(`No response content from ${model}`);
      return JSON.parse(textResponse);
    } catch (err) {
      console.warn(`   Model ${model} failed: ${err.message}`);
      lastError = err;
      // Wait 1.5 seconds before falling back
      await new Promise(r => setTimeout(r, 1500));
    }
  }
  throw lastError;
};

const callMistralVision = async (apiKey, base64Image) => {
  const url = 'https://api.mistral.ai/v1/chat/completions';
  const prompt = `You are an AI assistant specialized in Tunisian school books. Analyze this image and return a JSON object (strictly, no markdown, no other text) with the following schema:
{
  "title": "Book title",
  "author": "Author name (or empty/unknown)",
  "subject": "Closest subject from: Mathématiques, Physique, Chimie, Sciences, Sciences de la vie et de la terre, Français, Arabe, Anglais, Allemand, Espagnol, Histoire-Géographie, Philosophie, Éducation islamique, Informatique, Technologie, Économie, Comptabilité, Génie civil, Génie électrique, Génie mécanique, Arts plastiques, Sport, Autre",
  "level": "Closest school level from: Primaire — 1ère année, Primaire — 2ème année, Primaire — 3ème année, Primaire — 4ème année, Primaire — 5ème année, Primaire — 6ème année, Collège — 7ème année, Collège — 8ème année, Collège — 9ème année, Secondaire — 1ère année, Secondaire — 2ème année, Secondaire — 3ème année, Secondaire — 4ème année (BAC), Université — Licence, Université — Master, Université — Doctorat, Formation professionnelle, Autre",
  "isbn": "ISBN s'il est visible",
  "description": "Attractive 2-3 sentence description in French."
}`;

  const payload = {
    model: 'pixtral-12b-2409',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: `data:image/jpeg;base64,${base64Image}` }
        ]
      }
    ],
    response_format: { type: 'json_object' }
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Mistral API Error');
  }

  const textResponse = data.choices?.[0]?.message?.content;
  if (!textResponse) throw new Error('No response content from Mistral');
  return JSON.parse(textResponse);
};

const callCloudflareVision = async (accountId, token, imageBuffer) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/meta/llama-3.2-11b-vision-instruct`;
  const prompt = `Analyze this image and return ONLY a valid JSON object. Do not include any conversational text, markdown formatting, or explanations. Just the raw JSON. Use this exact schema:
{
  "title": "Exact book title in its original language (DO NOT TRANSLATE. If it is in Arabic, write it exactly in Arabic letters)",
  "author": "Author name in its original language (or empty/unknown)",
  "subject": "Closest subject from: Mathématiques, Physique, Chimie, Sciences, Sciences de la vie et de la terre, Français, Arabe, Anglais, Allemand, Espagnol, Histoire-Géographie, Philosophie, Éducation islamique, Informatique, Technologie, Économie, Comptabilité, Génie civil, Génie électrique, Génie mécanique, Arts plastiques, Sport, Autre",
  "level": "Closest school level from: Primaire — 1ère année, Primaire — 2ème année, Primaire — 3ème année, Primaire — 4ème année, Primaire — 5ème année, Primaire — 6ème année, Collège — 7ème année, Collège — 8ème année, Collège — 9ème année, Secondaire — 1ère année, Secondaire — 2ème année, Secondaire — 3ème année, Secondaire — 4ème année (BAC), Université — Licence, Université — Master, Université — Doctorat, Formation professionnelle, Autre",
  "isbn": "ISBN s'il est visible",
  "condition": "NEUF or BON ETAT or USAGE (estimate from cover condition)",
  "visual_design": "Extremely detailed description of the cover's exact visual design IN ENGLISH (e.g., 'Red top half, green bottom half, 3d isometric factory, white bold text'). This will be used as an image generation prompt to recreate the exact same layout and colors.",
  "description": "Attractive 2-3 sentence description in French."
}`;

  const payload = {
    prompt: prompt,
    image: Array.from(imageBuffer)
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.errors?.[0]?.message || 'Cloudflare API Error');
  }

  let textResponse = data.result?.response;
  if (!textResponse) throw new Error('No response content from Cloudflare');
  
  // If the API already parsed it into an object, return it directly
  if (typeof textResponse === 'object') {
    return textResponse;
  }

  // Clean conversational text and extract the JSON block
  const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    textResponse = jsonMatch[0];
  } else {
    throw new Error('Failed to extract JSON. Raw response: ' + textResponse);
  }
  
  return JSON.parse(textResponse);
};

const analyzeImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Aucune image fournie' });
    }

    const inputPath = req.file.path;
    const outputName = `enhanced-analysis-${req.file.filename}`;
    const outputPath = path.join(__dirname, '..', 'uploads', outputName);

    // 1. Locally optimize with sharp (resize to max 1024 to make API transmission faster and clean up contrast)
    await sharp(inputPath)
      .rotate()
      .normalise()
      .sharpen({ sigma: 1.0, flat: 1.0, jagged: 1.5 })
      .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 90 })
      .toFile(outputPath);

    // 2. Read the enhanced image and encode to base64
    const fileBuffer = fs.readFileSync(outputPath);
    const base64Image = fileBuffer.toString('base64');

    // 3. Query AI Vision model
    let parsedMetadata = {};
    const hasCF = !!process.env.CLOUDFLARE_API_TOKEN && !!process.env.CLOUDFLARE_ACCOUNT_ID;
    const hasGemini = !!process.env.GEMINI_API_KEY;
    const hasMistral = !!process.env.MISTRAL_API_KEY;

    if (hasCF) {
      parsedMetadata = await callCloudflareVision(process.env.CLOUDFLARE_ACCOUNT_ID, process.env.CLOUDFLARE_API_TOKEN, fileBuffer);
    } else if (hasGemini) {
      parsedMetadata = await callGeminiVision(process.env.GEMINI_API_KEY, base64Image);
    } else if (hasMistral) {
      parsedMetadata = await callMistralVision(process.env.MISTRAL_API_KEY, base64Image);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Clé API manquante. Veuillez configurer les variables Cloudflare, Gemini ou Mistral dans .env.'
      });
    }

    // 4. Fetch official book cover URL from Google Books or Open Library
    let officialCoverUrl = await fetchOfficialCover(
      parsedMetadata.title,
      parsedMetadata.author,
      parsedMetadata.isbn
    );

    // 5. Generate AI Cover URL
    // 5. Generate AI Cover URL using Custom Cloudflare Worker
    const CLOUDFLARE_WORKER_URL = process.env.CLOUDFLARE_WORKER_URL || "https://linkbook.saddikzrelli10.workers.dev/";
    const CLOUDFLARE_API_KEY = process.env.IMAGE_GENERATION_API_KEY;
    let aiCoverUrl = null;

    if (CLOUDFLARE_WORKER_URL && CLOUDFLARE_API_KEY) {
      try {
        const cfRes = await fetch(CLOUDFLARE_WORKER_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLOUDFLARE_API_KEY,
          },
          body: JSON.stringify({
            title: parsedMetadata.title || 'Livre',
            subject: parsedMetadata.subject || '',
            visualDesign: parsedMetadata.visual_design || '',
          }),
        });
        if (cfRes.ok) {
          const cfData = await cfRes.json();
          aiCoverUrl = cfData.url || cfData.imageUrl || null;
        }
      } catch (err) {
        console.error("Failed to generate CF cover:", err.message);
      }
    }

    if (!aiCoverUrl) {
      aiCoverUrl = `https://placehold.co/600x800/2777df/ffffff/png?text=${encodeURIComponent(parsedMetadata.title || 'Livre')}&font=roboto`;
    }

    // If official cover is missing, just make sure we return the aiCoverUrl
    if (!officialCoverUrl) officialCoverUrl = null;

    const protocol = req.protocol;
    const host = req.get('host');
    const enhancedUrl = `${protocol}://${host}/uploads/${outputName}`;

    res.status(200).json({
      success: true,
      data: {
        enhanced: enhancedUrl,
        metadata: parsedMetadata,
        officialCover: officialCoverUrl,
        aiCover: aiCoverUrl
      }
    });

  } catch (error) {
    console.error('Error in analyzeImage:', error);
    next(error);
  }
};

module.exports = {
  enhanceImage,
  analyzeImage
};
