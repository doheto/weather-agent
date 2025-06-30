import { OpenAINLPAdapter } from '../../../src/adapters/nlp/OpenAINLPAdapter';
import { TimeFrame, WeatherType } from '../../../src/core/entities/WeatherQuery';
import { WeatherData } from '../../../src/core/entities/WeatherData';
import OpenAI from 'openai';

// Mock OpenAI
jest.mock('openai');
const MockedOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe('OpenAINLPAdapter', () => {
  let adapter: OpenAINLPAdapter;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockCreate: jest.MockedFunction<any>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockCreate = jest.fn();
    mockOpenAI = {
      chat: {
        completions: {
          create: mockCreate
        }
      }
    } as any;

    MockedOpenAI.mockImplementation(() => mockOpenAI);

    adapter = new OpenAINLPAdapter({
      apiKey: 'test-api-key',
      model: 'gpt-3.5-turbo',
      temperature: 0.1,
      maxTokens: 500
    });
  });

  describe('extractIntent', () => {
    it('should extract weather intent correctly', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '{"location": "Paris", "timeframe": "now", "weatherType": "general", "confidence": 0.9}'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await adapter.extractIntent("What's the weather in Paris?");

      expect(result).toEqual({
        location: 'Paris',
        timeframe: TimeFrame.NOW,
        weatherType: WeatherType.GENERAL,
        confidence: 0.9
      });
    });

    it('should handle OpenAI API errors gracefully', async () => {
      mockCreate.mockRejectedValue(new Error('API Error'));

      const result = await adapter.extractIntent("Weather in Berlin?");

      expect(result).toEqual({
        location: 'current location',
        timeframe: TimeFrame.NOW,
        weatherType: WeatherType.GENERAL,
        confidence: 0.1
      });
    });
  });

  describe('generateResponse', () => {
    const mockWeatherData: WeatherData = {
      location: {
        name: 'Paris',
        country: 'FR',
        latitude: 48.8566,
        longitude: 2.3522
      },
      current: {
        temperature: 22,
        feelsLike: 24,
        humidity: 65,
        pressure: 1013,
        visibility: 10000,
        uvIndex: 4,
        condition: 'Partly Cloudy',
        description: 'partly cloudy',
        icon: '02d',
        windSpeed: 5.2,
        windDirection: 270
      },
      timestamp: new Date()
    };

    it('should generate natural language response from weather data', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: "It's currently 22°C in Paris with partly cloudy skies."
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await adapter.generateResponse(mockWeatherData, "What's the weather in Paris?");

      expect(result).toBe("It's currently 22°C in Paris with partly cloudy skies.");
    });

    it('should handle null weather data gracefully', async () => {
      const result = await adapter.generateResponse(null, "Weather in unknown location");

      expect(result).toContain("could not retrieve weather data");
      expect(mockCreate).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    it('should validate weather-related queries', () => {
      const validQueries = [
        "What's the weather like?",
        "Current temperature?",
        "Will it rain today?"
      ];

      validQueries.forEach(query => {
        expect(adapter.validateQuery(query)).toBe(true);
      });
    });

    it('should reject non-weather queries', () => {
      const invalidQueries = [
        "What's the capital of France?",
        "Recipe for pasta"
      ];

      invalidQueries.forEach(query => {
        expect(adapter.validateQuery(query)).toBe(false);
      });
    });
  });

  describe('extractLocation', () => {
    it('should extract location from text', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Paris'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await adapter.extractLocation("What's the weather in Paris?");

      expect(result).toBe('Paris');
    });

    it('should return null when no location is found', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'null'
          }
        }]
      };
      mockCreate.mockResolvedValue(mockResponse);

      const result = await adapter.extractLocation("What's the weather today?");

      expect(result).toBeNull();
    });
  });
});
