import { ProcessWeatherQueryUseCase } from '../../../src/core/usecases/ProcessWeatherQueryUseCase';
import { IWeatherDataPort } from '../../../src/core/ports/IWeatherDataPort';
import { INLPPort } from '../../../src/core/ports/INLPPort';
import { WeatherData } from '../../../src/core/entities/WeatherData';
import { WeatherIntent, TimeFrame, WeatherType } from '../../../src/core/entities/WeatherQuery';

describe('ProcessWeatherQueryUseCase', () => {
  let useCase: ProcessWeatherQueryUseCase;
  let mockWeatherDataPort: jest.Mocked<IWeatherDataPort>;
  let mockNLPPort: jest.Mocked<INLPPort>;

  beforeEach(() => {
    // Create mocks for our ports (hexagonal architecture)
    mockWeatherDataPort = {
      getCurrentWeather: jest.fn(),
      getForecast: jest.fn(),
      getWeatherByCoordinates: jest.fn(),
      searchLocations: jest.fn(),
    };

    mockNLPPort = {
      extractIntent: jest.fn(),
      generateResponse: jest.fn(),
      validateQuery: jest.fn(),
      extractLocation: jest.fn(),
    };

    useCase = new ProcessWeatherQueryUseCase(mockWeatherDataPort, mockNLPPort);
  });

  it('should process a valid weather query successfully', async () => {
    // Arrange
    const queryText = "What's the weather in San Francisco?";
    
    const mockIntent: WeatherIntent = {
      location: 'San Francisco',
      timeframe: TimeFrame.NOW,
      weatherType: WeatherType.GENERAL,
      confidence: 0.9
    };

    const mockWeatherData: WeatherData = {
      location: {
        name: 'San Francisco',
        country: 'US',
        latitude: 37.7749,
        longitude: -122.4194
      },
      current: {
        temperature: 22,
        feelsLike: 20,
        humidity: 60,
        pressure: 1013,
        visibility: 10,
        uvIndex: 5,
        condition: 'Clear',
        description: 'Clear sky',
        icon: '01d',
        windSpeed: 5,
        windDirection: 270
      },
      timestamp: new Date()
    };

    mockNLPPort.extractIntent.mockResolvedValue(mockIntent);
    mockWeatherDataPort.getCurrentWeather.mockResolvedValue(mockWeatherData);
    mockNLPPort.generateResponse.mockResolvedValue('It\'s currently 22°C with clear skies in San Francisco.');

    // Act
    const result = await useCase.execute(queryText);

    // Assert
    expect(result.query.originalText).toBe(queryText);
    expect(result.query.intent.location).toBe('San Francisco');
    expect(result.answer).toBe('It\'s currently 22°C with clear skies in San Francisco.');
    expect(result.confidence).toBe(0.9);
    expect(result.weatherData).toBe(mockWeatherData);
    
    // Verify hexagonal architecture - dependencies were called correctly
    expect(mockNLPPort.extractIntent).toHaveBeenCalledWith(queryText);
    expect(mockWeatherDataPort.getCurrentWeather).toHaveBeenCalledWith('San Francisco');
    expect(mockNLPPort.generateResponse).toHaveBeenCalledWith(mockWeatherData, queryText);
  });

  it('should handle errors gracefully', async () => {
    // Arrange
    const queryText = "Invalid query";
    mockNLPPort.extractIntent.mockRejectedValue(new Error('NLP service unavailable'));

    // Act
    const result = await useCase.execute(queryText);

    // Assert
    expect(result.confidence).toBe(0);
    expect(result.answer).toContain('I\'m sorry, I couldn\'t process your weather query');
    expect(result.weatherData).toBeNull();
  });
}); 