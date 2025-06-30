import { WeatherIntent } from '../entities/WeatherQuery';
import { WeatherData } from '../entities/WeatherData';

export interface INLPPort {
  extractIntent(query: string): Promise<WeatherIntent>;
  generateResponse(weatherData: WeatherData | null, originalQuery: string): Promise<string>;
  validateQuery(query: string): boolean;
  extractLocation(text: string): Promise<string | null>;
} 