import 'dotenv/config';
import { ServiceFactory } from '../src/infrastructure/WeatherServiceFactory';
import { ProcessWeatherQueryUseCase } from '../src/core/usecases/ProcessWeatherQueryUseCase';

/**
 * Integration test script for NLP-enhanced Weather Agent
 * 
 * This script demonstrates the complete workflow:
 * 1. Natural language query processing via OpenAI
 * 2. Intent extraction and location parsing
 * 3. Weather data retrieval via OpenWeatherMap API 3.0
 * 4. Natural language response generation
 */

async function testNLPIntegration() {
  console.log('🚀 Weather Agent NLP Integration Test');
  console.log('=====================================\n');

  try {
    // Initialize services
    console.log('📦 Initializing services...');
    const services = ServiceFactory.createFromEnv();
    const processWeatherQueryUseCase = new ProcessWeatherQueryUseCase(
      services.weatherService, 
      services.nlpService
    );
    console.log('✅ Services initialized successfully\n');

    // Test queries demonstrating different intent types
    const testQueries = [
      "What's the weather like in Paris today?",
      "Will it rain tomorrow in New York?", 
      "How hot is it in Tokyo right now?",
      "Is it windy in London?",
      "What's the temperature in Berlin?"
    ];

    console.log('🤖 Testing Natural Language Weather Queries:\n');

    for (const query of testQueries) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`💬 Query: "${query}"`);
      console.log('');

      try {
        const startTime = Date.now();
        const result = await processWeatherQueryUseCase.execute(query);
        const endTime = Date.now();

        // Display extracted intent
        console.log('🧠 Extracted Intent:');
        console.log(`   📍 Location: ${result.query.intent.location}`);
        console.log(`   ⏰ Timeframe: ${result.query.intent.timeframe}`);
        console.log(`   🌤️  Weather Type: ${result.query.intent.weatherType}`);
        console.log(`   🎯 Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        console.log('');

        // Display weather data summary
        if (result.weatherData) {
          console.log('🌍 Weather Data:');
          console.log(`   📍 Location: ${result.weatherData.location.name}, ${result.weatherData.location.country}`);
          console.log(`   🌡️  Temperature: ${result.weatherData.current.temperature}°C (feels like ${result.weatherData.current.feelsLike}°C)`);
          console.log(`   📝 Description: ${result.weatherData.current.description}`);
          console.log(`   💨 Wind: ${result.weatherData.current.windSpeed} m/s`);
          console.log(`   💧 Humidity: ${result.weatherData.current.humidity}%`);
          console.log('');
        }

        // Display natural language response
        console.log('💬 AI Response:');
        console.log(`   "${result.answer}"`);
        console.log('');
        console.log(`⚡ Processing time: ${endTime - startTime}ms`);

      } catch (error) {
        console.error('❌ Error processing query:', error);
      }

      console.log('');
    }

    console.log('✅ NLP Integration test completed successfully!');
    console.log('\n🎯 Key Features Demonstrated:');
    console.log('   • Natural language understanding via OpenAI GPT');
    console.log('   • Intent extraction (location, timeframe, weather type)');
    console.log('   • Live weather data from OpenWeatherMap API 3.0');
    console.log('   • Conversational response generation');
    console.log('   • Graceful error handling and fallbacks');
    console.log('   • Hexagonal architecture with clean separation');

  } catch (error) {
    console.error('❌ Integration test failed:', error);
    console.error('\n🔧 Troubleshooting:');
    console.error('   • Ensure OPENWEATHER_API_KEY is set in .env');
    console.error('   • Ensure OPENAI_API_KEY is set in .env');
    console.error('   • Check your internet connection');
    console.error('   • Verify API keys are valid and have sufficient credits');
    process.exit(1);
  }
}

async function testQueryValidation() {
  console.log('\n🔍 Testing Query Validation:');
  console.log('===============================\n');

  try {
    const services = ServiceFactory.createFromEnv();
    const nlpService = services.nlpService;

    const weatherQueries = [
      "What's the weather in Paris?",
      "Will it rain today?",
      "How hot is it outside?",
      "Is it sunny in Tokyo?"
    ];

    const nonWeatherQueries = [
      "What's the capital of France?",
      "Recipe for chocolate cake",
      "Latest stock prices",
      "How to learn TypeScript?"
    ];

    console.log('✅ Valid weather queries:');
    weatherQueries.forEach(query => {
      const isValid = nlpService.validateQuery(query);
      console.log(`   ${isValid ? '✅' : '❌'} "${query}"`);
    });

    console.log('\n❌ Non-weather queries (should be rejected):');
    nonWeatherQueries.forEach(query => {
      const isValid = nlpService.validateQuery(query);
      console.log(`   ${!isValid ? '✅' : '❌'} "${query}"`);
    });

  } catch (error) {
    console.error('❌ Query validation test failed:', error);
  }
}

// Environment check
function checkEnvironment() {
  const requiredEnvVars = ['OPENWEATHER_API_KEY', 'OPENAI_API_KEY'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
      console.error(`   • ${varName}`);
    });
    console.error('\n💡 Please set these in your .env file');
    process.exit(1);
  }
}

// Main execution
async function main() {
  checkEnvironment();
  await testQueryValidation();
  await testNLPIntegration();
}

if (require.main === module) {
  main().catch(console.error);
} 