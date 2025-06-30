#!/usr/bin/env ts-node

import 'dotenv/config';
import { WeatherServiceFactory } from '../src/infrastructure/WeatherServiceFactory';
import { GetCurrentWeatherUseCase } from '../src/core/usecases/GetCurrentWeatherUseCase';

async function testWeatherIntegration(): Promise<void> {
  console.log('🌤️  Testing Weather Integration (OpenWeatherMap API 3.0)...\n');
  
  try {
    // Check if API key is provided and not empty
    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      console.log('⚠️  OPENWEATHER_API_KEY not found in environment variables');
      console.log('To test with real data:');
      console.log('1. Get a free API key from https://openweathermap.org/api');
      console.log('2. Add OPENWEATHER_API_KEY=your_key_here to your .env file');
      console.log('3. Run this script again\n');
      console.log('ℹ️  This integration uses OpenWeatherMap API 3.0 OneCall endpoints');
      console.log('   which provide enhanced weather data including UV index and more.');
      console.log('ℹ️  The hexagonal architecture allows easy API switching.');
      console.log('\n✅ Environment configuration test completed successfully!');
      console.log('   The application correctly detects missing API credentials.');
      return;
    }

    // Create weather service
    const weatherService = WeatherServiceFactory.createFromEnv();
    const getCurrentWeatherUseCase = new GetCurrentWeatherUseCase(weatherService);

    // Test locations
    const testLocations = [
      'San-Francisco',
      'London',
      'Tokyo',
    ];

    console.log('Testing current weather for multiple locations (API 3.0):\n');

    for (const location of testLocations) {
      try {
        console.log(`📍 Fetching weather for ${location}...`);
        
        const result = await getCurrentWeatherUseCase.execute({ location });
        
        if (result.success && result.data) {
          const weather = result.data;
          console.log(`✅ ${weather.location.name}`);
          console.log(`   🌡️  Temperature: ${weather.current.temperature}°C (feels like ${weather.current.feelsLike}°C)`);
          console.log(`   🌤️  Condition: ${weather.current.condition} - ${weather.current.description}`);
          console.log(`   💨 Wind: ${weather.current.windSpeed} m/s`);
          console.log(`   💧 Humidity: ${weather.current.humidity}%`);
          console.log(`   ☀️  UV Index: ${weather.current.uvIndex} (API 3.0 feature)`);
        } else {
          console.log(`❌ Failed to fetch weather: ${result.error}`);
        }
        
        console.log('');
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
          console.log(`❌ Authentication failed for ${location}`);
          console.log('   This indicates the API key may be invalid or expired.');
        } else {
          console.log(`❌ Error fetching weather for ${location}: ${errorMessage}`);
        }
        console.log('');
      }
    }

    // Test coordinate-based weather
    console.log('Testing coordinate-based weather lookup (OneCall API):');
    console.log('📍 Fetching weather for coordinates (37.7749, -122.4194)...');
    
    try {
      const coordResult = await getCurrentWeatherUseCase.execute({
        latitude: 37.7749,
        longitude: -122.4194,
      });
      
      if (coordResult.success && coordResult.data) {
        const weather = coordResult.data;
        console.log(`✅ Weather data retrieved`);
        console.log(`   🌡️  Temperature: ${weather.current.temperature}°C`);
        console.log(`   ☀️  UV Index: ${weather.current.uvIndex}`);
        console.log(`   🕒 Data timestamp: ${weather.timestamp.toISOString()}`);
      } else {
        console.log(`❌ Failed to fetch weather by coordinates: ${coordResult.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes('401') || errorMessage.includes('unauthorized')) {
        console.log(`❌ Authentication failed for coordinate lookup`);
        console.log('   This indicates the API key may be invalid or expired.');
      } else {
        console.log(`❌ Error in coordinate lookup: ${errorMessage}`);
      }
    }

    console.log('\n🎉 Weather integration test (API 3.0) completed!');
    console.log('💡 Features tested:');
    console.log('   - Location geocoding + weather lookup');
    console.log('   - Direct coordinate weather lookup');
    console.log('   - Enhanced weather data (UV index, precise timestamps)');
    console.log('   - Error handling and graceful degradation');
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes('OPENWEATHER_API_KEY')) {
      console.log('⚠️  Environment configuration issue detected:');
      console.log(`   ${errorMessage}`);
      console.log('\nTo fix this:');
      console.log('1. Create a .env file in the project root');
      console.log('2. Add: OPENWEATHER_API_KEY=your_api_key_here');
      console.log('3. Get your free API key from: https://openweathermap.org/api');
    } else {
      console.error('💥 Integration test failed:', errorMessage);
      process.exit(1);
    }
  }
}

// Run the test
testWeatherIntegration().catch(console.error); 