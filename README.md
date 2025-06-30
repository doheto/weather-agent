# Weather Agent

A **natural language weather agent** built with hexagonal architecture that understands and responds to weather-related questions using **OpenAI GPT** and live data from **OpenWeatherMap API 3.0**.

🤖 **Ask in natural language**: *"What's the weather like in Paris today?"*  
🌤️ **Get conversational responses**: *"It's currently 22°C in Paris with partly cloudy skies..."*

## 🏗️ Architecture

This project implements **Hexagonal Architecture** (Ports & Adapters pattern) with clear separation between:

- **Core Business Logic** (`src/core/`) - Pure business rules, no external dependencies
- **Adapters** (`src/adapters/`) - External world implementations (APIs, databases, web)
- **Infrastructure** (`src/infrastructure/`) - Framework configuration and utilities

```
src/
├── core/               # Business logic (no dependencies)
│   ├── entities/       # WeatherData, WeatherQuery, CalendarEvent
│   ├── usecases/       # ProcessWeatherQueryUseCase, GetCurrentWeatherUseCase
│   └── ports/          # IWeatherDataPort, INLPPort, ICalendarPort
├── adapters/           # External world implementations
│   ├── weather/        # OpenWeatherMap API 3.0 client ✅
│   ├── nlp/           # OpenAI GPT integration ✅
│   ├── calendar/      # Google Calendar integration (upcoming)
│   └── web/           # Express REST API ✅
└── infrastructure/    # Service factory, configuration ✅
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- **OpenWeatherMap API key** (free at https://openweathermap.org/api)
- **OpenAI API key** (get at https://platform.openai.com/api-keys)

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Create .env file and add:
OPENWEATHER_API_KEY=your_weather_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Optional (with defaults):
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/3.0
OPENWEATHER_GEO_BASE_URL=https://api.openweathermap.org/geo/1.0
OPENAI_MODEL=gpt-3.5-turbo
```

3. **Test the integrations:**
```bash
npm run test:weather    # Test weather API only
npm run test:nlp       # Test full NLP workflow
```

4. **Start development server:**
```bash
npm run dev
```

5. **Run tests:**
```bash
npm test
```

## 🎯 Features

- [x] **Hexagonal architecture foundation** ✅
- [x] **OpenWeatherMap API 3.0 integration** ✅
- [x] **OneCall API with enhanced weather data** ✅
- [x] **Current weather by location name or coordinates** ✅
- [x] **8-day weather forecast (API 3.0)** ✅
- [x] **UV Index and enhanced meteorological data** ✅
- [x] **Location geocoding and search** ✅
- [x] **Weather overview with human-readable summaries** ✅
- [x] **Natural language query processing (OpenAI GPT)** ✅
- [x] **Intent extraction and validation** ✅
- [x] **Conversational AI responses** ✅
- [x] **REST API endpoints** ✅
- [x] **Comprehensive error handling** ✅
- [ ] Google Calendar integration
- [ ] Web interface

## 🤖 Natural Language Processing (OpenAI GPT)

Our NLP integration provides intelligent weather conversations:

- **Intent Extraction**: Automatically identifies location, timeframe, and weather type
- **Query Validation**: Filters weather vs non-weather queries  
- **Conversational Responses**: GPT-generated natural language answers
- **Confidence Scoring**: AI confidence levels for intent accuracy
- **Fallback Handling**: Graceful degradation when APIs are unavailable

### Example Interactions
```typescript
Query: "Will it rain tomorrow in New York?"
Intent: { location: "New York", timeframe: "tomorrow", weatherType: "precipitation" }
Response: "Tomorrow in New York, there's a 20% chance of light rain with temperatures around 18°C..."

Query: "What's the temperature in Tokyo?"  
Intent: { location: "Tokyo", timeframe: "now", weatherType: "temperature" }
Response: "The current temperature in Tokyo is 27°C, feeling like 31°C with high humidity..."
```


### External API Endpoints Used
```bash
# OpenWeatherMap API 3.0
Current Weather + Forecast:
https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API_key}

Weather Overview (Natural Language):
https://api.openweathermap.org/data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API_key}

Location Geocoding:
https://api.openweathermap.org/geo/1.0/direct?q={city}&appid={API_key}

# OpenAI API
Chat Completions (GPT-3.5/4):
https://api.openai.com/v1/chat/completions
```

### Weather Agent REST API
```bash
GET  /              # API documentation and health
GET  /health        # Service health check
POST /query         # Natural language weather queries  
GET  /weather/:location  # Direct weather lookup (legacy)
```


## 🔧 Development & Testing

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production  
- `npm start` - Start production server
- `npm test` - Run all unit tests
- `npm run test:weather` - Test weather API integration only
- `npm run test:nlp` - Test full NLP + weather workflow
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Auto-fix linting issues

### Test Express REST API
```bash
# Start the server
npm start

# Make natural language weather queries
curl -X POST http://localhost:3000/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Will it rain tomorrow in London?"}'

# Direct weather lookup  
curl http://localhost:3000/weather/Tokyo

# Health check
curl http://localhost:3000/health
```

