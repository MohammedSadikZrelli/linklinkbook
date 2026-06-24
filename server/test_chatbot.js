const axios = require('axios');

async function runTests() {
  console.log("🚀 Testing Mistral AI Chatbot on LinkBook API...\n");

  const testCases = [
    "Je veux vendre un livre de mathématiques",
    "Je cherche des annales pour le Bac",
    "Comment recharger mon solde ?"
  ];

  for (const message of testCases) {
    console.log(`\n========================================`);
    console.log(`👤 User: "${message}"`);
    try {
      const res = await axios.post('http://localhost:5000/api/chat/ask', {
        message,
        context: { params: {}, history: [] }
      });
      console.log(`🤖 Bot Intent: [${res.data.action || res.data.params.intent || 'search/chat'}]`);
      console.log(`🤖 Reply: ${res.data.reply}`);
      if (res.data.books && res.data.books.length > 0) {
        console.log(`📚 Found ${res.data.books.length} books!`);
        console.log(`   First book: ${res.data.books[0].title}`);
      }
    } catch (e) {
      console.error(`❌ Error:`, e.response ? e.response.data : e.message);
    }
  }
}

runTests();
