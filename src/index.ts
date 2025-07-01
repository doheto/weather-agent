import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ServiceFactory } from './infrastructure/WeatherServiceFactory';
import { ProcessWeatherQueryUseCase } from './core/usecases/ProcessWeatherQueryUseCase';
import { GetCurrentWeatherUseCase } from './core/usecases/GetCurrentWeatherUseCase';
import { auth } from './config/auth';
import { toNodeHandler } from 'better-auth/node';

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize services
let weatherService: any;
let nlpService: any;
let processWeatherQueryUseCase: ProcessWeatherQueryUseCase;
let getCurrentWeatherUseCase: GetCurrentWeatherUseCase;

try {
  const services = ServiceFactory.createFromEnv();
  weatherService = services.weatherService;
  nlpService = services.nlpService;
  
  // Initialize use cases
  processWeatherQueryUseCase = new ProcessWeatherQueryUseCase(weatherService, nlpService);
  getCurrentWeatherUseCase = new GetCurrentWeatherUseCase(weatherService);
  
  console.log('✅ Services initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize services:', error);
  console.error('Please ensure OPENWEATHER_API_KEY and OPENAI_API_KEY are set in environment variables');
  process.exit(1);
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173' || 'https://weather-agent-henna.vercel.app ',
  credentials: true,
}));
app.use(morgan('combined'));

// Mount Better Auth BEFORE express.json() middleware
// This is critical - Better Auth must handle requests before JSON parsing
app.all('/api/auth/*', toNodeHandler(auth));

// Apply JSON middleware only to non-auth routes
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Basic route
app.get('/', (_req, res) => {
  res.json({ 
    message: 'Weather Agent API',
    version: '2.0.0',
    architecture: 'hexagonal',
    features: [
      'Natural Language Processing (OpenAI)',
      'Live Weather Data (OpenWeatherMap API 3.0)',
      'Intent Extraction',
      'Conversational Responses'
    ],
    endpoints: {
      '/health': 'Health check',
      '/': 'API information',
      'POST /query': 'Natural language weather query',
      'GET /weather/:location': 'Direct weather lookup'
    }
  });
});

// Natural language weather query endpoint
app.post('/query', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Query parameter is required and must be a string',
        example: { query: "What's the weather in Paris?" }
      });
    }

    // Validate that the query is weather-related
    if (!nlpService.validateQuery(query)) {
      return res.status(400).json({
        error: 'Query does not appear to be weather-related',
        suggestion: 'Try asking about weather, temperature, rain, or forecast',
        example: "What's the weather like in London?"
      });
    }

    console.log(`🤖 Processing query: "${query}"`);
    
    const result = await processWeatherQueryUseCase.execute(query);
    
    return res.json({
      query: result.query.originalText,
      answer: result.answer,
      intent: {
        location: result.query.intent.location,
        timeframe: result.query.intent.timeframe,
        weatherType: result.query.intent.weatherType,
        confidence: result.confidence
      },
      weatherData: result.weatherData ? {
        location: result.weatherData.location,
        current: result.weatherData.current,
        ...(result.weatherData.forecast && result.weatherData.forecast.length > 0 && {
          forecast: result.weatherData.forecast.slice(0, 3) // Limit forecast for response size
        })
      } : null,
      timestamp: result.timestamp
    });
  } catch (error) {
    console.error('❌ Error processing query:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process weather query'
    });
  }
});

// Direct weather lookup endpoint (legacy support)
app.get('/weather/:location', async (req, res) => {
  try {
    const { location } = req.params;
    
    if (!location) {
      return res.status(400).json({
        error: 'Location parameter is required'
      });
    }

    console.log(`🌍 Direct weather lookup for: ${location}`);
    
    const result = await getCurrentWeatherUseCase.execute({ location });
    
    if (!result.success) {
      return res.status(400).json({
        error: 'Failed to fetch weather data',
        message: result.error
      });
    }

    return res.json({
      location: result.data!.location,
      current: result.data!.current,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching weather:', error);
    return res.status(500).json({
      error: 'Failed to fetch weather data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Endpoint ${req.method} ${req.path} not found`,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /query',
      'GET /weather/:location'
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🌤️  Weather Agent running on port ${PORT}`);
  console.log(`📐 Architecture: Hexagonal (Ports & Adapters)`);
  console.log(`🤖 NLP: OpenAI GPT Integration`);
  console.log(`🌍 Weather: OpenWeatherMap API 3.0`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`💬 Try: POST http://localhost:${PORT}/query with {"query": "What's the weather in Paris?"}`);
}); 