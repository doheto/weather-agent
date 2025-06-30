# Weather Agent

A natural language weather agent built with hexagonal architecture that understands and responds to weather-related questions using live data.

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
│   ├── weather/        # Weather API clients
│   ├── nlp/           # Natural language processing
│   ├── calendar/      # Google Calendar integration
│   └── web/           # REST API controllers
└── infrastructure/    # Framework, configuration
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Setup

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
# Copy environment template
cp .env.example .env

# Add your API keys:
# - OpenWeatherMap API key
# - OpenAI API key  
# - Google Calendar credentials (optional)
```

3. **Start development server:**
```bash
npm run dev
```

4. **Run tests:**
```bash
npm test
```

## 🎯 Features

- [x] Hexagonal architecture foundation
- [ ] Live weather data integration
- [ ] Natural language query processing
- [ ] Google Calendar utilities
- [ ] REST API endpoints
- [ ] Web interface

## 🔧 Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run lint` - Check code quality

## 📁 Current Status

✅ **Phase 0 Complete:** Project foundation with hexagonal architecture
- TypeScript configuration
- Core entities and ports defined
- Basic Express server setup
- Testing framework configured

**Next:** Phase 1 - Weather API integration
