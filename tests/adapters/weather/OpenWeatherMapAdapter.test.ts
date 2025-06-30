import axios from 'axios';
import { OpenWeatherMapAdapter } from '../../../src/adapters/weather/OpenWeatherMapAdapter';
import { 
  mockOneCallCurrentResponse, 
  mockOneCallForecastResponse,
  mockGeocodingResponse 
} from '../../mocks/openWeatherMapResponses';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('OpenWeatherMapAdapter', () => {
  let adapter: OpenWeatherMapAdapter;
  const mockAxiosInstance = {
    get: jest.fn(),
  };
  const mockGeoAxiosInstance = {
    get: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock axios.create to return different instances for different base URLs
    mockedAxios.create.mockImplementation((config) => {
      if (config?.baseURL?.includes('geo')) {
        return mockGeoAxiosInstance as any;
      }
      return mockAxiosInstance as any;
    });
    
    adapter = new OpenWeatherMapAdapter({
      apiKey: 'test-api-key',
      baseUrl: 'https://api.openweathermap.org/data/3.0',
    });
  });

  describe('constructor', () => {
    it('should create axios instances with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledTimes(2);
      
      // OneCall API instance
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.openweathermap.org/data/3.0',
        timeout: 10000,
        params: {
          appid: 'test-api-key',
          units: 'metric',
        },
      });
      
      // Geocoding API instance
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.openweathermap.org/geo/1.0',
        timeout: 10000,
        params: {
          appid: 'test-api-key',
        },
      });
    });

    it('should use custom timeout when provided', () => {
      new OpenWeatherMapAdapter({
        apiKey: 'test-api-key',
        baseUrl: 'https://api.openweathermap.org/data/3.0',
        timeout: 5000,
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          timeout: 5000,
        })
      );
    });
  });

  describe('getCurrentWeather', () => {
    it('should fetch and transform current weather data by location name', async () => {
      // Mock geocoding response
      mockGeoAxiosInstance.get.mockResolvedValueOnce({
        data: mockGeocodingResponse,
      });
      
      // Mock weather response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockOneCallCurrentResponse,
      });

      const result = await adapter.getCurrentWeather('San Francisco');

      // Verify geocoding call
      expect(mockGeoAxiosInstance.get).toHaveBeenCalledWith('/direct', {
        params: { q: 'San Francisco', limit: 5 },
      });
      
      // Verify weather call
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/onecall', {
        params: { 
          lat: 37.7749295, 
          lon: -122.4194155,
          exclude: 'minutely,hourly,daily,alerts'
        },
      });

      expect(result).toEqual({
        location: {
          name: 'America/Los_Angeles',
          country: 'Unknown',
          latitude: 37.7749295,
          longitude: -122.4194155,
        },
        current: {
          temperature: 23, // Rounded from 22.5
          feelsLike: 21,   // Rounded from 20.8
          humidity: 60,
          pressure: 1013,
          visibility: 10,  // Converted from 10000m to 10km
          uvIndex: 5,      // Rounded from 5.2
          condition: 'Clear',
          description: 'clear sky',
          icon: '01d',
          windSpeed: 4,    // Rounded from 3.5
          windDirection: 270,
        },
        timestamp: expect.any(Date),
      });
    });

    it('should handle location not found error', async () => {
      mockGeoAxiosInstance.get.mockResolvedValue({ data: [] });

      await expect(adapter.getCurrentWeather('InvalidCity')).rejects.toThrow(
        'Failed to fetch current weather for InvalidCity: Error: Location "InvalidCity" not found'
      );
    });

    it('should handle API errors gracefully', async () => {
      mockGeoAxiosInstance.get.mockRejectedValue(new Error('Geocoding failed'));

      await expect(adapter.getCurrentWeather('TestCity')).rejects.toThrow(
        'Failed to fetch current weather for TestCity: Error: Failed to search locations for TestCity: Error: Geocoding failed'
      );
    });
  });

  describe('getForecast', () => {
    it('should fetch and transform forecast data', async () => {
      // Mock geocoding response
      mockGeoAxiosInstance.get.mockResolvedValueOnce({
        data: mockGeocodingResponse,
      });
      
      // Mock forecast response
      mockAxiosInstance.get.mockResolvedValueOnce({
        data: mockOneCallForecastResponse,
      });

      const result = await adapter.getForecast('San Francisco', 2);

      expect(mockGeoAxiosInstance.get).toHaveBeenCalledWith('/direct', {
        params: { q: 'San Francisco', limit: 5 },
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/onecall', {
        params: { 
          lat: 37.7749295, 
          lon: -122.4194155,
          exclude: 'minutely,alerts'
        },
      });

      expect(result.location).toEqual({
        name: 'San Francisco',
        country: 'US',
        latitude: 37.7749295,
        longitude: -122.4194155,
      });

      expect(result.forecast).toHaveLength(2);
      
      const firstDay = result.forecast[0];
      expect(firstDay.date).toBeInstanceOf(Date);
      expect(firstDay.temperature.min).toBe(16); // From temp.min
      expect(firstDay.temperature.max).toBe(24); // From temp.max
      expect(firstDay.condition).toBe('Clouds');
      expect(firstDay.precipitation.probability).toBe(20); // From pop: 0.2
      expect(firstDay.wind.speed).toBe(3); // Rounded from 2.8
      expect(firstDay.wind.direction).toBe(245);
    });

    it('should handle forecast API errors', async () => {
      mockGeoAxiosInstance.get.mockResolvedValueOnce({
        data: mockGeocodingResponse,
      });
      mockAxiosInstance.get.mockRejectedValue(new Error('API limit exceeded'));

      await expect(adapter.getForecast('San Francisco', 5)).rejects.toThrow(
        'Failed to fetch forecast for San Francisco: Error: API limit exceeded'
      );
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should fetch weather by coordinates', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: mockOneCallCurrentResponse,
      });

      const result = await adapter.getWeatherByCoordinates(37.7749, -122.4194);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/onecall', {
        params: { 
          lat: 37.7749, 
          lon: -122.4194,
          exclude: 'minutely,hourly,daily,alerts'
        },
      });

      expect(result.location.latitude).toBe(37.7749);
      expect(result.location.longitude).toBe(-122.4194);
    });

    it('should handle coordinate API errors', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Invalid coordinates'));

      await expect(adapter.getWeatherByCoordinates(999, 999)).rejects.toThrow(
        'Failed to fetch weather for coordinates 999, 999: Error: Invalid coordinates'
      );
    });
  });

  describe('searchLocations', () => {
    it('should search and return location suggestions', async () => {
      mockGeoAxiosInstance.get.mockResolvedValue({
        data: mockGeocodingResponse,
      });

      const result = await adapter.searchLocations('San Francisco');

      expect(mockGeoAxiosInstance.get).toHaveBeenCalledWith('/direct', {
        params: { q: 'San Francisco', limit: 5 },
      });

      expect(result).toEqual([
        {
          name: 'San Francisco',
          country: 'US',
          latitude: 37.7749295,
          longitude: -122.4194155,
        },
        {
          name: 'San Francisco',
          country: 'US',
          latitude: 37.0,
          longitude: -122.0,
        },
      ]);
    });

    it('should handle geocoding API errors', async () => {
      mockGeoAxiosInstance.get.mockRejectedValue(new Error('Geocoding failed'));

      await expect(adapter.searchLocations('InvalidLocation')).rejects.toThrow(
        'Failed to search locations for InvalidLocation: Error: Geocoding failed'
      );
    });
  });

  describe('getWeatherOverview', () => {
    it('should fetch weather overview', async () => {
      const mockOverviewResponse = {
        weather_overview: 'Today will be mostly clear with temperatures reaching 22°C.'
      };
      
      mockAxiosInstance.get.mockResolvedValue({
        data: mockOverviewResponse,
      });

      const result = await adapter.getWeatherOverview(37.7749, -122.4194);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/onecall/overview', {
        params: { lat: 37.7749, lon: -122.4194 },
      });

      expect(result).toBe('Today will be mostly clear with temperatures reaching 22°C.');
    });

    it('should handle overview API errors gracefully', async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error('Overview not available'));

      const result = await adapter.getWeatherOverview(37.7749, -122.4194);

      expect(result).toBe('Weather overview not available');
    });
  });

  describe('error handling', () => {
    it('should handle missing wind data gracefully', async () => {
      const responseWithoutWind = {
        ...mockOneCallCurrentResponse,
        current: {
          ...mockOneCallCurrentResponse.current,
          wind_speed: undefined,
          wind_deg: undefined,
        },
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: responseWithoutWind,
      });

      const result = await adapter.getWeatherByCoordinates(37.7749, -122.4194);

      expect(result.current.windSpeed).toBe(0);
      expect(result.current.windDirection).toBe(0);
    });

    it('should handle missing visibility data gracefully', async () => {
      const responseWithoutVisibility = {
        ...mockOneCallCurrentResponse,
        current: {
          ...mockOneCallCurrentResponse.current,
          visibility: undefined,
        },
      };

      mockAxiosInstance.get.mockResolvedValue({
        data: responseWithoutVisibility,
      });

      const result = await adapter.getWeatherByCoordinates(37.7749, -122.4194);

      expect(result.current.visibility).toBe(10); // Default value
    });
  });
}); 