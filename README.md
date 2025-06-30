# Weather Agent

A natural language weather agent built with hexagonal architecture that understands and responds to weather-related questions using live data from **OpenWeatherMap API 3.0**.

## 🏗️ Architecture

This project implements **Hexagonal Architecture** (Ports & Adapters pattern) with clear separation between:

- **Core Business Logic** (`src/core/`) - Pure business rules, no external dependencies
- **Adapters** (`src/adapters/`) - External world implementations (APIs, databases, web)
- **Infrastructure** (`src/infrastructure/`) - Framework configuration and utilities

```
src/
├── core/               # Business logic (no dependencies)
│   ├── entities/       # WeatherData, WeatherQuery, CalendarEvent
│   ├── usecases/       # Business operations
│   └── ports/          # Interfaces for external world
├── adapters/           # External world implementations
│   ├── weather/        # OpenWeatherMap API 3.0 client ✅
│   ├── nlp/           # Natural language processing
│   ├── calendar/      # Google Calendar integration
│   └── web/           # REST API controllers
└── infrastructure/    # Framework, configuration ✅
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenWeatherMap API key (free at https://openweathermap.org/api)

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Create .env file and add:
OPENWEATHER_API_KEY=your_api_key_here
OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/3.0
OPENWEATHER_GEO_BASE_URL=https://api.openweathermap.org/geo/1.0
```

3. **Test the weather integration:**
```bash
npm run test:integration
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

- [x] Hexagonal architecture foundation
- [x] **OpenWeatherMap API 3.0 integration** ✅
- [x] **OneCall API with enhanced weather data** ✅
- [x] **Current weather by location name or coordinates** ✅
- [x] **8-day weather forecast (API 3.0)** ✅
- [x] **UV Index and enhanced meteorological data** ✅
- [x] **Location geocoding and search** ✅
- [x] **Weather overview with human-readable summaries** ✅
- [x] **Comprehensive error handling** ✅
- [ ] Natural language query processing
- [ ] Google Calendar utilities
- [ ] REST API endpoints
- [ ] Web interface

## 🌟 OpenWeatherMap API 3.0 Benefits

Our integration leverages the latest **API 3.0 OneCall** endpoints providing:

- **Enhanced Data**: UV index, dew point, cloud coverage, moon phases
- **Single Call Efficiency**: Current weather + 8-day forecast in one request
- **Higher Accuracy**: Improved weather models and forecasting
- **Rich Metadata**: Precise timestamps, timezone information
- **Weather Overviews**: Human-readable weather summaries

### API Endpoints Used
```
Current Weather + Forecast:
https://api.openweathermap.org/data/3.0/onecall?lat={lat}&lon={lon}&appid={API_key}

Weather Overview (Natural Language):
https://api.openweathermap.org/data/3.0/onecall/overview?lat={lat}&lon={lon}&appid={API_key}

Location Geocoding:
https://api.openweathermap.org/geo/1.0/direct?q={city}&appid={API_key}
```

## 🧪 Testing

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test real weather API 3.0 integration
npm run test:integration
```

**Test Coverage:** 26 tests passing across 3 test suites:
- Core business logic (use cases)
- Weather adapter (OpenWeatherMap API 3.0 integration)
- Mock data transformations and edge cases

## 🔧 Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run test:integration` - Test with real weather API 3.0
- `npm run lint` - Check code quality

## ⚡ Current Capabilities

### Weather Data Fetching (API 3.0)
```typescript
import { WeatherServiceFactory } from './src/infrastructure/WeatherServiceFactory';
import { GetCurrentWeatherUseCase } from './src/core/usecases/GetCurrentWeatherUseCase';

// Get weather service (automatically uses API 3.0)
const weatherService = WeatherServiceFactory.createFromEnv();
const useCase = new GetCurrentWeatherUseCase(weatherService);

// Fetch by location name (geocoding + weather)
const result = await useCase.execute({ location: 'San Francisco' });

// Fetch by coordinates (direct OneCall API)
const result = await useCase.execute({ 
  latitude: 37.7749, 
  longitude: -122.4194 
});
```

### Enhanced Weather Data (API 3.0)
- **Current Conditions**: Temperature, feels-like, humidity, pressure
- **Wind Information**: Speed, direction, gusts
- **Visibility & UV**: Enhanced visibility data, UV index
- **Atmospheric Data**: Dew point, cloud coverage percentage
- **Forecasting**: 8-day daily forecasts with min/max temperatures
- **Precipitation**: Probability and amount for rain/snow
- **Location Data**: Precise coordinates, timezone information

### Weather Overview Feature
```typescript
// Get human-readable weather summary (API 3.0 exclusive)
const overview = await adapter.getWeatherOverview(37.7749, -122.4194);
// Returns: "Today will be mostly clear with temperatures reaching 22°C..."
```

## 📁 Current Status

✅ **Phase 0 Complete:** Project foundation with hexagonal architecture
✅ **Phase 1 Complete:** Weather API 3.0 integration
- **OpenWeatherMap API 3.0 OneCall integration**
- **Enhanced weather data (UV index, dew point, etc.)**
- **Efficient single-call architecture**
- **Location geocoding with fallback handling**
- **8-day weather forecasting**
- **Weather overview summaries**
- **100% test coverage for weather integration**
- **Real API 3.0 integration testing**

**Next:** Phase 2 - Natural language processing integration

## 🔄 Migration from API 2.5 to 3.0

This implementation uses **OpenWeatherMap API 3.0**, which provides:

| Feature | API 2.5 | API 3.0 ✅ |
|---------|---------|-----------|
| Weather Calls | 2 calls (current + forecast) | 1 call (OneCall) |
| UV Index | ❌ Not available | ✅ Included |
| Weather Overview | ❌ Not available | ✅ Human-readable |
| Forecast Length | 5 days | 8 days |
| Data Precision | Basic | Enhanced |

The hexagonal architecture makes this API upgrade seamless - core business logic remains unchanged!
