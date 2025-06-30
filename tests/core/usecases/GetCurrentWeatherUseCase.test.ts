import { GetCurrentWeatherUseCase } from '../../../src/core/usecases/GetCurrentWeatherUseCase';
import { IWeatherDataPort } from '../../../src/core/ports/IWeatherDataPort';
import { WeatherData } from '../../../src/core/entities/WeatherData';

describe('GetCurrentWeatherUseCase', () => {
  let useCase: GetCurrentWeatherUseCase;
  let mockWeatherDataPort: jest.Mocked<IWeatherDataPort>;

  const mockWeatherData: WeatherData = {
    location: {
      name: 'San Francisco',
      country: 'US',
      latitude: 37.7749,
      longitude: -122.4194,
    },
    current: {
      temperature: 22,
      feelsLike: 20,
      humidity: 60,
      pressure: 1013,
      visibility: 10,
      uvIndex: 5,
      condition: 'Clear',
      description: 'clear sky',
      icon: '01d',
      windSpeed: 5,
      windDirection: 270,
    },
    timestamp: new Date(),
  };

  beforeEach(() => {
    mockWeatherDataPort = {
      getCurrentWeather: jest.fn(),
      getForecast: jest.fn(),
      getWeatherByCoordinates: jest.fn(),
      searchLocations: jest.fn(),
    };

    useCase = new GetCurrentWeatherUseCase(mockWeatherDataPort);
  });

  describe('execute', () => {
    it('should fetch weather by location name', async () => {
      mockWeatherDataPort.getCurrentWeather.mockResolvedValue(mockWeatherData);

      const result = await useCase.execute({ location: 'San Francisco' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWeatherData);
      expect(result.error).toBeUndefined();
      expect(mockWeatherDataPort.getCurrentWeather).toHaveBeenCalledWith('San Francisco');
    });

    it('should fetch weather by coordinates', async () => {
      mockWeatherDataPort.getWeatherByCoordinates.mockResolvedValue(mockWeatherData);

      const result = await useCase.execute({ 
        latitude: 37.7749, 
        longitude: -122.4194 
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockWeatherData);
      expect(result.error).toBeUndefined();
      expect(mockWeatherDataPort.getWeatherByCoordinates).toHaveBeenCalledWith(37.7749, -122.4194);
    });

    it('should prefer location name over coordinates when both provided', async () => {
      mockWeatherDataPort.getCurrentWeather.mockResolvedValue(mockWeatherData);

      const result = await useCase.execute({ 
        location: 'San Francisco',
        latitude: 37.7749, 
        longitude: -122.4194 
      });

      expect(result.success).toBe(true);
      expect(mockWeatherDataPort.getCurrentWeather).toHaveBeenCalledWith('San Francisco');
      expect(mockWeatherDataPort.getWeatherByCoordinates).not.toHaveBeenCalled();
    });

    it('should return error when no location or coordinates provided', async () => {
      const result = await useCase.execute({});

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Either location name or coordinates (latitude and longitude) must be provided');
      expect(mockWeatherDataPort.getCurrentWeather).not.toHaveBeenCalled();
      expect(mockWeatherDataPort.getWeatherByCoordinates).not.toHaveBeenCalled();
    });

    it('should return error when only latitude provided', async () => {
      const result = await useCase.execute({ latitude: 37.7749 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Either location name or coordinates (latitude and longitude) must be provided');
    });

    it('should return error when only longitude provided', async () => {
      const result = await useCase.execute({ longitude: -122.4194 });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Either location name or coordinates (latitude and longitude) must be provided');
    });

    it('should handle weather service errors gracefully', async () => {
      const errorMessage = 'Weather service unavailable';
      mockWeatherDataPort.getCurrentWeather.mockRejectedValue(new Error(errorMessage));

      const result = await useCase.execute({ location: 'InvalidCity' });

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe(errorMessage);
    });

    it('should handle unknown errors gracefully', async () => {
      mockWeatherDataPort.getCurrentWeather.mockRejectedValue('Unknown error');

      const result = await useCase.execute({ location: 'TestCity' });

      expect(result.success).toBe(false);
      expect(result.data).toBeUndefined();
      expect(result.error).toBe('Unknown error occurred');
    });
  });
}); 