export interface WeatherQuery {
  originalText: string;
  intent: WeatherIntent;
  timestamp: Date;
}

export interface WeatherIntent {
  location: string;
  timeframe: TimeFrame;
  weatherType: WeatherType;
  confidence: number;
}

export enum TimeFrame {
  NOW = 'now',
  TODAY = 'today',
  TOMORROW = 'tomorrow',
  THIS_WEEK = 'this_week',
  NEXT_WEEK = 'next_week',
  CUSTOM = 'custom'
}

export enum WeatherType {
  GENERAL = 'general',
  TEMPERATURE = 'temperature',
  PRECIPITATION = 'precipitation',
  WIND = 'wind',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  UV_INDEX = 'uv_index'
}

export interface QueryResponse {
  query: WeatherQuery;
  answer: string;
  weatherData?: any;
  confidence: number;
  timestamp: Date;
} 