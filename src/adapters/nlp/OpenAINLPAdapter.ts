import OpenAI from 'openai';
import { INLPPort } from '../../core/ports/INLPPort';
import { WeatherIntent, TimeFrame, WeatherType } from '../../core/entities/WeatherQuery';
import { WeatherData } from '../../core/entities/WeatherData';

export interface OpenAINLPConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class OpenAINLPAdapter implements INLPPort {
  private openai: OpenAI;
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor(config: OpenAINLPConfig) {
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'gpt-3.5-turbo';
    this.temperature = config.temperature || 0.1;
    this.maxTokens = config.maxTokens || 500;
  }

  async extractIntent(query: string): Promise<WeatherIntent> {
    const prompt = `Extract weather intent from this query: "${query}"

You must respond with a valid JSON object containing:
- location: string (extract city/location, if none found use "current location")
- timeframe: one of: "now", "today", "tomorrow", "this_week", "next_week", "custom"
- weatherType: one of: "general", "temperature", "precipitation", "wind", "humidity", "pressure", "uv_index"
- confidence: number between 0-1

Examples:
Query: "What's the weather in Paris?"
Response: {"location": "Paris", "timeframe": "now", "weatherType": "general", "confidence": 0.9}

Only respond with the JSON object, no other text:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      const parsed = JSON.parse(content);
      
      return {
        location: parsed.location || 'current location',
        timeframe: this.validateTimeFrame(parsed.timeframe),
        weatherType: this.validateWeatherType(parsed.weatherType),
        confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
      };
    } catch (error) {
      console.error('Error extracting intent:', error);
      return {
        location: 'current location',
        timeframe: TimeFrame.NOW,
        weatherType: WeatherType.GENERAL,
        confidence: 0.1
      };
    }
  }

  async generateResponse(weatherData: WeatherData | null, originalQuery: string): Promise<string> {
    if (!weatherData) {
      return `I could not retrieve weather data for your query: "${originalQuery}". Please check the location and try again.`;
    }

    const prompt = `Generate a natural, conversational weather response.

User Query: "${originalQuery}"
Location: ${weatherData.location.name}
Temperature: ${weatherData.current.temperature}°C
Description: ${weatherData.current.description}
Humidity: ${weatherData.current.humidity}%

Keep response under 100 words and be conversational.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      });

      return response.choices[0]?.message?.content?.trim() || 
        `The weather in ${weatherData.location.name} is ${weatherData.current.temperature}°C with ${weatherData.current.description}.`;
    } catch (error) {
      console.error('Error generating response:', error);
      return `The weather in ${weatherData.location.name} is ${weatherData.current.temperature}°C with ${weatherData.current.description}.`;
    }
  }

  validateQuery(query: string): boolean {
    const weatherKeywords = [
      'weather', 'temperature', 'rain', 'snow', 'wind', 'humidity', 
      'pressure', 'forecast', 'cloudy', 'sunny', 'storm', 'degrees',
      'hot', 'cold', 'warm', 'cool', 'precipitation', 'umbrella'
    ];
    
    const lowercaseQuery = query.toLowerCase();
    return weatherKeywords.some(keyword => lowercaseQuery.includes(keyword));
  }

  async extractLocation(text: string): Promise<string | null> {
    const prompt = `Extract the location/city name from this text: "${text}"

If there's a clear location mentioned, return just the city/location name.
If no location is found, return null.
Only respond with the location name or null, no other text.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 50,
      });

      const content = response.choices[0]?.message?.content?.trim();
      return content === 'null' ? null : content || null;
    } catch (error) {
      console.error('Error extracting location:', error);
      return null;
    }
  }

  private validateTimeFrame(timeframe: string): TimeFrame {
    const validTimeFrames = Object.values(TimeFrame);
    return validTimeFrames.includes(timeframe as TimeFrame) 
      ? timeframe as TimeFrame 
      : TimeFrame.NOW;
  }

  private validateWeatherType(weatherType: string): WeatherType {
    const validWeatherTypes = Object.values(WeatherType);
    return validWeatherTypes.includes(weatherType as WeatherType)
      ? weatherType as WeatherType
      : WeatherType.GENERAL;
  }
}
