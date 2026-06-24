require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');

const realisticBooks = [
  // Mathématiques
  { title: "Oxygène Mathématiques Tome 1", subject: "Mathématiques", level: "Bac", type: "vente", condition: "Bon état", price: 25, location: "Tunis", desc: "Livre parascolaire Oxygène pour les bacheliers section Maths. Contient des résumés de cours et des exercices corrigés. Presque neuf." },
  { title: "Série d'exercices Maths 3ème année", subject: "Mathématiques", level: "3ème année", type: "échange", condition: "Usagé", price: 0, location: "Sfax", desc: "Polycopiés et séries d'exercices de mathématiques pour la 3ème année section sciences. Je cherche à l'échanger contre un livre de physique." },
  { title: "Annales Bac Maths 2015-2023", subject: "Mathématiques", level: "Bac", type: "vente", condition: "Neuf", price: 30, location: "Sousse", desc: "Toutes les épreuves nationales du Bac avec corrigés détaillés. Indispensable pour la révision." },
  { title: "Livre de Math 1ère année secondaire", subject: "Mathématiques", level: "1ère année", type: "don", condition: "Usagé", price: 0, location: "Ariana", desc: "Manuel scolaire officiel de mathématiques pour la première année. Je le donne gratuitement." },
  
  // Physique
  { title: "Physique Chimie - Collection Pilote", subject: "Physique", level: "Bac", type: "vente", condition: "Neuf", price: 28, location: "Bizerte", desc: "Collection Pilote physique chimie pour la section sciences expérimentales. Édition récente." },
  { title: "Devoirat Physique 2ème année", subject: "Physique", level: "2ème année", type: "échange", condition: "Bon état", price: 0, location: "Nabeul", desc: "Séries de devoirs de contrôle et de synthèse avec correction. À échanger contre un livre de français." },
  { title: "Manuel de Physique 4ème Sciences", subject: "Physique", level: "Bac", type: "vente", condition: "Bon état", price: 15, location: "Tunis", desc: "Manuel scolaire officiel de physique. Quelques notes au crayon mais en très bon état général." },
  
  // Français
  { title: "Le Dernier Jour d'un Condamné", subject: "Français", level: "1ère année", type: "vente", condition: "Neuf", price: 8, location: "Sfax", desc: "Roman de Victor Hugo, au programme de la première année secondaire. Édition de poche." },
  { title: "Candide ou l'Optimisme", subject: "Français", level: "Bac", type: "don", condition: "Usagé", price: 0, location: "Tunis", desc: "Conte philosophique de Voltaire. Livre un peu usé mais toutes les pages sont lisibles. Gratuit." },
  { title: "Parascolaire Français 3ème année", subject: "Français", level: "3ème année", type: "vente", condition: "Bon état", price: 12, location: "Sousse", desc: "Livre d'aide pour la production écrite et l'analyse de textes en français." },
  { title: "Madame Bovary - Flaubert", subject: "Français", level: "Supérieur", type: "échange", condition: "Neuf", price: 0, location: "Ariana", desc: "Roman classique étudié à l'université (lettres françaises). Je l'échange contre 'Les Fleurs du Mal'." },

  // Anglais
  { title: "English for IT Students", subject: "Anglais", level: "Supérieur", type: "vente", condition: "Bon état", price: 20, location: "Ariana", desc: "Livre d'anglais technique pour les étudiants en informatique (ISET/Fac). Très utile." },
  { title: "Grammar in Use - Intermediate", subject: "Anglais", level: "Lycée", type: "vente", condition: "Neuf", price: 45, location: "Tunis", desc: "Livre de grammaire anglaise de référence avec exercices et corrigés. Excellent pour améliorer son niveau." },
  { title: "Séries Anglais Bac", subject: "Anglais", level: "Bac", type: "échange", condition: "Usagé", price: 0, location: "Bizerte", desc: "Séries de révision pour le bac d'anglais (reading, writing, language). À échanger." },
  
  // Sciences / SVT
  { title: "SVT - Parascolaire 100% Bac", subject: "SVT", level: "Bac", type: "vente", condition: "Bon état", price: 22, location: "Sfax", desc: "Livre de révision complet pour la section Math avec des QCM et des exercices d'analyse." },
  { title: "Manuel Sciences de la Vie et de la Terre", subject: "SVT", level: "3ème année", type: "don", condition: "Usagé", price: 0, location: "Sousse", desc: "Livre étatique de SVT 3ème sciences. Je le donne pour quelqu'un qui en a besoin." },
  { title: "Biologie Cellulaire - Cours Universitaire", subject: "Sciences", level: "Supérieur", type: "vente", condition: "Neuf", price: 35, location: "Tunis", desc: "Ouvrage de référence pour les étudiants en première année médecine ou biologie." },

  // Informatique
  { title: "Algorithmique et Programmation Python", subject: "Informatique", level: "3ème année", type: "vente", condition: "Bon état", price: 18, location: "Nabeul", desc: "Livre d'exercices en Python pour les élèves de 3ème année informatique. Très pratique." },
  { title: "Bases de données et Web Bac", subject: "Informatique", level: "Bac", type: "échange", condition: "Neuf", price: 0, location: "Ariana", desc: "Livre parascolaire contenant PHP, HTML, et SQL. Je souhaite l'échanger contre le livre de TIC." },
  
  // Philosophie & Histoire-Géo
  { title: "Mourchid en Philosophie", subject: "Philosophie", level: "Bac", type: "vente", condition: "Bon état", price: 15, location: "Tunis", desc: "Livre d'aide en philosophie avec méthodologie de dissertation et explication de texte." },
  { title: "Manuel Histoire-Géo 2ème année", subject: "Géographie", level: "2ème année", type: "don", condition: "Usagé", price: 0, location: "Sfax", desc: "Manuel officiel d'histoire et géographie. À récupérer sur Sfax centre." },
  { title: "Fiches de révision Histoire Bac", subject: "Histoire", level: "Bac", type: "vente", condition: "Neuf", price: 10, location: "Sousse", desc: "Des résumés clairs et précis de tous les chapitres d'histoire pour le baccalauréat." },

  // Primaire / Collège
  { title: "Livre de Lecture 6ème année primaire", subject: "Français", level: "Primaire", type: "vente", condition: "Bon état", price: 5, location: "Tunis", desc: "Livre de lecture officiel pour la 6ème année. Bien conservé." },
  { title: "Maths 8ème année de base", subject: "Mathématiques", level: "Collège", type: "échange", condition: "Usagé", price: 0, location: "Bizerte", desc: "Manuel de mathématiques 8ème. Je cherche le manuel de la 9ème année en échange." },
  { title: "Anglais 9ème année - Parascolaire", subject: "Anglais", level: "Collège", type: "don", condition: "Bon état", price: 0, location: "Ariana", desc: "Cahier d'activités avec corrigés pour la 9ème année. Gratuit." },
];

async function seedBooks() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ MongoDB Connected for Realistic Seeding');

    let user = await User.findOne({ email: 'seed@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Seed User',
        email: 'seed@example.com',
        password: 'password123',
        phone: '12345678',
        role: 'user'
      });
      console.log('Created dummy seed user.');
    } else {
      // Clean up previous seed books
      await Book.deleteMany({ user: user._id });
      console.log('Cleared old seed books.');
    }

    const booksToInsert = realisticBooks.map(bookData => ({
      title: bookData.title,
      subject: bookData.subject,
      level: bookData.level,
      condition: bookData.condition,
      description: bookData.desc,
      author: 'Ministère de l\'Éducation / Éditeur privé',
      location: bookData.location,
      price: bookData.price,
      type: bookData.type,
      status: 'Disponible',
      user: user._id,
      images: []
    }));

    // Clone array to reach exactly 50 varied books by slightly modifying duplicates
    let finalBooks = [...booksToInsert];
    let counter = 1;
    while (finalBooks.length < 50) {
      const baseBook = finalBooks[Math.floor(Math.random() * booksToInsert.length)];
      finalBooks.push({
        ...baseBook,
        title: `${baseBook.title} (Copie ${counter})`,
        price: baseBook.type === 'vente' ? baseBook.price + Math.floor(Math.random() * 5) : 0,
        location: ['Tunis', 'Sfax', 'Sousse', 'Nabeul', 'Bizerte', 'Ariana', 'Gabès', 'Monastir'][Math.floor(Math.random() * 8)]
      });
      counter++;
    }

    await Book.insertMany(finalBooks);
    console.log(`✅ Successfully seeded ${finalBooks.length} highly realistic French books!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
}

seedBooks();
