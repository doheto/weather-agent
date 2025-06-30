export interface WeatherData {
  location: {
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    visibility: number;
    uvIndex: number;
    condition: string;
    description: string;
    icon: string;
    windSpeed: number;
    windDirection: number;
  };
  timestamp: Date;
}

export interface WeatherForecast {
  location: WeatherData['location'];
  forecast: Array<{
    date: Date;
    temperature: {
      min: number;
      max: number;
    };
    condition: string;
    description: string;
    icon: string;
    precipitation: {
      probability: number;
      amount?: number;
    };
    wind: {
      speed: number;
      direction: number;
    };
  }>;
} 