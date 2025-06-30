import { OpenWeatherMapAdapter } from '../adapters/weather/OpenWeatherMapAdapter';
import { IWeatherDataPort } from '../core/ports/IWeatherDataPort';

export interface WeatherServiceConfig {
  provider: 'openweathermap';
  apiKey: string;
  baseUrl?: string;
  geoBaseUrl?: string;
  timeout?: number;
}

export class WeatherServiceFactory {
  static create(config: WeatherServiceConfig): IWeatherDataPort {
    switch (config.provider) {
      case 'openweathermap':
        const adapterConfig = {
          apiKey: config.apiKey,
          baseUrl: config.baseUrl || 'https://api.openweathermap.org/data/3.0',
          ...(config.geoBaseUrl && { geoBaseUrl: config.geoBaseUrl }),
          ...(config.timeout !== undefined && { timeout: config.timeout }),
        };
        return new OpenWeatherMapAdapter(adapterConfig);
      
      default:
        throw new Error(`Unsupported weather provider: ${config.provider}`);
    }
  }

  static createFromEnv(): IWeatherDataPort {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const baseUrl = process.env.OPENWEATHER_BASE_URL;
    const geoBaseUrl = process.env.OPENWEATHER_GEO_BASE_URL;
    
    if (!apiKey) {
      throw new Error('OPENWEATHER_API_KEY environment variable is required');
    }

    const serviceConfig: WeatherServiceConfig = {
      provider: 'openweathermap',
      apiKey,
      ...(baseUrl && { baseUrl }),
      ...(geoBaseUrl && { geoBaseUrl }),
    };

    return this.create(serviceConfig);
  }
} 