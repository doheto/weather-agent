import { WeatherQuery, WeatherIntent, QueryResponse } from '../entities/WeatherQuery';
import { IWeatherDataPort } from '../ports/IWeatherDataPort';
import { INLPPort } from '../ports/INLPPort';

export class ProcessWeatherQueryUseCase {
  constructor(
    private weatherDataPort: IWeatherDataPort,
    private nlpPort: INLPPort
  ) {}

  async execute(queryText: string): Promise<QueryResponse> {
    const timestamp = new Date();
    
    try {
      // Step 1: Extract intent from natural language
      const intent = await this.nlpPort.extractIntent(queryText);
      
      const weatherQuery: WeatherQuery = {
        originalText: queryText,
        intent,
        timestamp
      };

      // Step 2: Get weather data based on intent
      const weatherData = await this.weatherDataPort.getCurrentWeather(intent.location);
      
      // Step 3: Generate natural language response
      const answer = await this.nlpPort.generateResponse(weatherData, queryText);
      
      return {
        query: weatherQuery,
        answer,
        weatherData,
        confidence: intent.confidence,
        timestamp
      };
      
    } catch (error) {
      // Handle errors gracefully
      const fallbackIntent: WeatherIntent = {
        location: 'unknown',
        timeframe: 'now' as any,
        weatherType: 'general' as any,
        confidence: 0
      };
      
      const weatherQuery: WeatherQuery = {
        originalText: queryText,
        intent: fallbackIntent,
        timestamp
      };
      
      return {
        query: weatherQuery,
        answer: `I'm sorry, I couldn't process your weather query: "${queryText}". Please try asking about the weather in a specific location.`,
        weatherData: null,
        confidence: 0,
        timestamp
      };
    }
  }
} 