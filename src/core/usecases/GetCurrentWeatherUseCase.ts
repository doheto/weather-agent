import { IWeatherDataPort } from '../ports/IWeatherDataPort';
import { WeatherData } from '../entities/WeatherData';

export interface GetCurrentWeatherRequest {
  location?: string;
  latitude?: number;
  longitude?: number;
}

export interface GetCurrentWeatherResponse {
  success: boolean;
  data?: WeatherData;
  error?: string;
}

export class GetCurrentWeatherUseCase {
  constructor(private weatherDataPort: IWeatherDataPort) {}

  async execute(request: GetCurrentWeatherRequest): Promise<GetCurrentWeatherResponse> {
    try {
      // Validate input
      if (!request.location && (!request.latitude || !request.longitude)) {
        return {
          success: false,
          error: 'Either location name or coordinates (latitude and longitude) must be provided',
        };
      }

      let weatherData: WeatherData;

      // Fetch weather data using appropriate method
      if (request.location) {
        weatherData = await this.weatherDataPort.getCurrentWeather(request.location);
      } else {
        weatherData = await this.weatherDataPort.getWeatherByCoordinates(
          request.latitude!,
          request.longitude!
        );
      }

      return {
        success: true,
        data: weatherData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
} 