import axios, { AxiosInstance } from 'axios';
import { IWeatherDataPort } from '../../core/ports/IWeatherDataPort';
import { WeatherData, WeatherForecast } from '../../core/entities/WeatherData';

export interface OpenWeatherMapConfig {
  apiKey: string;
  baseUrl: string;
  geoBaseUrl?: string;
  timeout?: number;
  retryAttempts?: number;
}

export class OpenWeatherMapAdapter implements IWeatherDataPort {
  private client: AxiosInstance;
  private geoClient: AxiosInstance;
  private config: Required<OpenWeatherMapConfig>;

  constructor(config: OpenWeatherMapConfig) {
    this.config = {
      timeout: 10000,
      retryAttempts: 3,
      geoBaseUrl: 'https://api.openweathermap.org/geo/1.0',
      ...config,
    };

    // Client for OneCall API 3.0
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      params: {
        appid: this.config.apiKey,
        units: 'metric', // Use Celsius
      },
    });

    // Client for Geocoding API
    this.geoClient = axios.create({
      baseURL: this.config.geoBaseUrl,
      timeout: this.config.timeout,
      params: {
        appid: this.config.apiKey,
      },
    });
  }

  async getCurrentWeather(location: string): Promise<WeatherData> {
    try {
      // First, get coordinates for the location
      const coordinates = await this.getCoordinatesFromLocation(location);
      
      // Then get weather data using OneCall API 3.0
      return this.getWeatherByCoordinates(coordinates.latitude, coordinates.longitude);
    } catch (error) {
      throw new Error(`Failed to fetch current weather for ${location}: ${error}`);
    }
  }

  async getForecast(location: string, days: number): Promise<WeatherForecast> {
    try {
      // Get coordinates for the location
      const coordinates = await this.getCoordinatesFromLocation(location);
      
      // Get weather data using OneCall API 3.0
      const response = await this.client.get('/onecall', {
        params: { 
          lat: coordinates.latitude, 
          lon: coordinates.longitude,
          exclude: 'minutely,alerts' // Exclude minutely and alerts to reduce response size
        },
      });

      return this.transformForecastResponse(response.data, days, coordinates);
    } catch (error) {
      throw new Error(`Failed to fetch forecast for ${location}: ${error}`);
    }
  }

  async getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData> {
    try {
      const response = await this.client.get('/onecall', {
        params: { 
          lat: latitude, 
          lon: longitude,
          exclude: 'minutely,hourly,daily,alerts' // Only get current weather
        },
      });

      return this.transformCurrentWeatherResponse(response.data, { latitude, longitude });
    } catch (error) {
      throw new Error(`Failed to fetch weather for coordinates ${latitude}, ${longitude}: ${error}`);
    }
  }

  async searchLocations(query: string): Promise<Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>> {
    try {
      const response = await this.geoClient.get('/direct', {
        params: { q: query, limit: 5 },
      });

      return response.data.map((location: any) => ({
        name: location.name,
        country: location.country,
        latitude: location.lat,
        longitude: location.lon,
      }));
    } catch (error) {
      throw new Error(`Failed to search locations for ${query}: ${error}`);
    }
  }

  private async getCoordinatesFromLocation(location: string): Promise<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }> {
    const locations = await this.searchLocations(location);
    
    if (locations.length === 0) {
      throw new Error(`Location "${location}" not found`);
    }
    
    return locations[0]; // Return the first match
  }

  private transformCurrentWeatherResponse(data: any, coordinates: { latitude: number; longitude: number }): WeatherData {
    const current = data.current;
    
    return {
      location: {
        name: data.timezone || 'Unknown', // OneCall doesn't provide city name directly
        country: 'Unknown', // Will be filled by geocoding in real usage
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
      current: {
        temperature: Math.round(current.temp),
        feelsLike: Math.round(current.feels_like),
        humidity: current.humidity,
        pressure: current.pressure,
        visibility: current.visibility ? Math.round(current.visibility / 1000) : 10, // Convert to km
        uvIndex: Math.round(current.uvi || 0),
        condition: current.weather[0].main,
        description: current.weather[0].description,
        icon: current.weather[0].icon,
        windSpeed: Math.round(current.wind_speed || 0),
        windDirection: current.wind_deg || 0,
      },
      timestamp: new Date(current.dt * 1000),
    };
  }

  private transformForecastResponse(
    data: any, 
    days: number, 
    locationInfo: { name: string; country: string; latitude: number; longitude: number }
  ): WeatherForecast {
    const location = {
      name: locationInfo.name,
      country: locationInfo.country,
      latitude: locationInfo.latitude,
      longitude: locationInfo.longitude,
    };

    // Use daily forecast data from OneCall API 3.0
    const forecast = data.daily
      .slice(0, days)
      .map((day: any) => ({
        date: new Date(day.dt * 1000),
        temperature: {
          min: Math.round(day.temp.min),
          max: Math.round(day.temp.max),
        },
        condition: day.weather[0].main,
        description: day.weather[0].description,
        icon: day.weather[0].icon,
        precipitation: {
          probability: Math.round((day.pop || 0) * 100), // Probability of precipitation
          amount: (day.rain?.['1h'] || 0) + (day.snow?.['1h'] || 0), // Rain + snow amount
        },
        wind: {
          speed: Math.round(day.wind_speed || 0),
          direction: day.wind_deg || 0,
        },
      }));

    return { location, forecast };
  }

  // New method to get weather overview (API 3.0 feature)
  async getWeatherOverview(latitude: number, longitude: number): Promise<string> {
    try {
      const response = await this.client.get('/onecall/overview', {
        params: { lat: latitude, lon: longitude },
      });

      return response.data.weather_overview || 'No overview available';
    } catch (error) {
      // Fallback if overview endpoint fails
      return 'Weather overview not available';
    }
  }
} 