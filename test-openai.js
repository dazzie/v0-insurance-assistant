// Test script to verify OpenAI integration
const OpenAI = require('openai');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

async function testOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === 'your-openai-api-key-here') {
    console.error('❌ OpenAI API key not configured properly!');
    console.log('Please update .env.local with your actual OpenAI API key');
    return;
  }

  console.log('✅ OpenAI API key found');
  
  try {
    const openai = new OpenAI({
      apiKey: apiKey,
    });

    console.log('Testing OpenAI connection...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say 'Hello, OpenAI is working!' if you can hear me." }
      ],
      max_tokens: 50,
    });

    console.log('✅ OpenAI API response:', completion.choices[0].message.content);
    console.log('\n✅ OpenAI integration is working correctly!');
    console.log('\nYour app is now ready to use with OpenAI.');
    console.log('The app will automatically use OpenAI when a valid key is present.');
    console.log('To use mock responses instead, set USE_MOCK_RESPONSES=true in .env.local');
    
  } catch (error) {
    console.error('❌ Error connecting to OpenAI:', error.message);
    console.log('\nPossible issues:');
    console.log('1. Invalid API key');
    console.log('2. No internet connection');
    console.log('3. OpenAI service issues');
    console.log('\nThe app will fall back to mock responses when OpenAI is unavailable.');
  }
}

testOpenAI();