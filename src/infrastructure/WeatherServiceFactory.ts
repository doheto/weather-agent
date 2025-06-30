import { OpenWeatherMapAdapter } from '../adapters/weather/OpenWeatherMapAdapter';
import { OpenAINLPAdapter } from '../adapters/nlp/OpenAINLPAdapter';
import { IWeatherDataPort } from '../core/ports/IWeatherDataPort';
import { INLPPort } from '../core/ports/INLPPort';

export interface WeatherServiceConfig {
  provider: 'openweathermap';
  apiKey: string;
  baseUrl?: string;
  geoBaseUrl?: string;
  timeout?: number;
}

export interface NLPServiceConfig {
  provider: 'openai';
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ServiceFactoryResult {
  weatherService: IWeatherDataPort;
  nlpService: INLPPort;
}

export class ServiceFactory {
  static createWeatherService(config: WeatherServiceConfig): IWeatherDataPort {
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

  static createNLPService(config: NLPServiceConfig): INLPPort {
    switch (config.provider) {
      case 'openai':
        return new OpenAINLPAdapter({
          apiKey: config.apiKey,
          model: config.model || 'gpt-3.5-turbo',
          temperature: config.temperature || 0.1,
          maxTokens: config.maxTokens || 500,
        });
      
      default:
        throw new Error(`Unsupported NLP provider: ${config.provider}`);
    }
  }

  static createFromEnv(): ServiceFactoryResult {
    // Weather service configuration
    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    const weatherBaseUrl = process.env.OPENWEATHER_BASE_URL;
    const weatherGeoBaseUrl = process.env.OPENWEATHER_GEO_BASE_URL;
    
    if (!weatherApiKey) {
      throw new Error('OPENWEATHER_API_KEY environment variable is required');
    }

    const weatherConfig: WeatherServiceConfig = {
      provider: 'openweathermap',
      apiKey: weatherApiKey,
      ...(weatherBaseUrl && { baseUrl: weatherBaseUrl }),
      ...(weatherGeoBaseUrl && { geoBaseUrl: weatherGeoBaseUrl }),
    };

    // NLP service configuration
    const nlpApiKey = process.env.OPENAI_API_KEY;
    const nlpModel = process.env.OPENAI_MODEL;
    const nlpTemperature = process.env.OPENAI_TEMPERATURE;
    const nlpMaxTokens = process.env.OPENAI_MAX_TOKENS;
    
    if (!nlpApiKey) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    const nlpConfig: NLPServiceConfig = {
      provider: 'openai',
      apiKey: nlpApiKey,
      ...(nlpModel && { model: nlpModel }),
      ...(nlpTemperature && { temperature: parseFloat(nlpTemperature) }),
      ...(nlpMaxTokens && { maxTokens: parseInt(nlpMaxTokens) }),
    };

    return {
      weatherService: this.createWeatherService(weatherConfig),
      nlpService: this.createNLPService(nlpConfig),
    };
  }
}

// Legacy exports for backward compatibility
export class WeatherServiceFactory {
  static create(config: WeatherServiceConfig): IWeatherDataPort {
    return ServiceFactory.createWeatherService(config);
  }

  static createFromEnv(): IWeatherDataPort {
    // Only create weather service, don't require OpenAI API key
    const weatherApiKey = process.env.OPENWEATHER_API_KEY;
    const weatherBaseUrl = process.env.OPENWEATHER_BASE_URL;
    const weatherGeoBaseUrl = process.env.OPENWEATHER_GEO_BASE_URL;
    
    if (!weatherApiKey) {
      throw new Error('OPENWEATHER_API_KEY environment variable is required');
    }

    const weatherConfig: WeatherServiceConfig = {
      provider: 'openweathermap',
      apiKey: weatherApiKey,
      ...(weatherBaseUrl && { baseUrl: weatherBaseUrl }),
      ...(weatherGeoBaseUrl && { geoBaseUrl: weatherGeoBaseUrl }),
    };

    return ServiceFactory.createWeatherService(weatherConfig);
  }
} 