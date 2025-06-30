import { WeatherData, WeatherForecast } from '../entities/WeatherData';

export interface IWeatherDataPort {
  getCurrentWeather(location: string): Promise<WeatherData>;
  getForecast(location: string, days: number): Promise<WeatherForecast>;
  getWeatherByCoordinates(latitude: number, longitude: number): Promise<WeatherData>;
  searchLocations(query: string): Promise<Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>>;
} 