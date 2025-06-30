// Mock response for OpenWeatherMap API 3.0 OneCall current weather (with exclusions)
export const mockOneCallCurrentResponse = {
  lat: 37.7749,
  lon: -122.4194,
  timezone: 'America/Los_Angeles',
  timezone_offset: -28800,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1640998800,
    temp: 22.5,
    feels_like: 20.8,
    pressure: 1013,
    humidity: 60,
    dew_point: 15.2,
    uvi: 5.2,
    clouds: 0,
    visibility: 10000,
    wind_speed: 3.5,
    wind_deg: 270,
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }
    ]
  }
};

// Mock response for OpenWeatherMap API 3.0 OneCall with daily forecast
export const mockOneCallForecastResponse = {
  lat: 37.7749,
  lon: -122.4194,
  timezone: 'America/Los_Angeles',
  timezone_offset: -28800,
  current: {
    dt: 1640995200,
    sunrise: 1640966400,
    sunset: 1640998800,
    temp: 22.5,
    feels_like: 20.8,
    pressure: 1013,
    humidity: 60,
    dew_point: 15.2,
    uvi: 5.2,
    clouds: 0,
    visibility: 10000,
    wind_speed: 3.5,
    wind_deg: 270,
    weather: [
      {
        id: 800,
        main: 'Clear',
        description: 'clear sky',
        icon: '01d'
      }
    ]
  },
  daily: [
    {
      dt: 1641024000,
      sunrise: 1640966400,
      sunset: 1640998800,
      moonrise: 1640989200,
      moonset: 1641042000,
      moon_phase: 0.25,
      temp: {
        day: 20.5,
        min: 16.2,
        max: 23.8,
        night: 18.1,
        eve: 21.3,
        morn: 17.5
      },
      feels_like: {
        day: 19.8,
        night: 17.5,
        eve: 20.9,
        morn: 17.1
      },
      pressure: 1015,
      humidity: 65,
      dew_point: 14.8,
      wind_speed: 2.8,
      wind_deg: 245,
      wind_gust: 4.2,
      weather: [
        {
          id: 803,
          main: 'Clouds',
          description: 'broken clouds',
          icon: '04d'
        }
      ],
      clouds: 75,
      pop: 0.2,
      uvi: 6.1
    },
    {
      dt: 1641110400,
      sunrise: 1641052800,
      sunset: 1641085200,
      moonrise: 1641075600,
      moonset: 1641128400,
      moon_phase: 0.3,
      temp: {
        day: 25.1,
        min: 19.5,
        max: 27.3,
        night: 21.2,
        eve: 24.8,
        morn: 20.1
      },
      feels_like: {
        day: 24.5,
        night: 20.8,
        eve: 24.2,
        morn: 19.7
      },
      pressure: 1012,
      humidity: 55,
      dew_point: 16.1,
      wind_speed: 4.1,
      wind_deg: 280,
      wind_gust: 6.8,
      weather: [
        {
          id: 500,
          main: 'Rain',
          description: 'light rain',
          icon: '10d'
        }
      ],
      clouds: 85,
      pop: 0.6,
      rain: {
        '1h': 0.5
      },
      uvi: 5.8
    },
    {
      dt: 1641196800,
      sunrise: 1641139200,
      sunset: 1641171600,
      moonrise: 1641162000,
      moonset: 1641214800,
      moon_phase: 0.35,
      temp: {
        day: 18.2,
        min: 14.1,
        max: 20.5,
        night: 15.8,
        eve: 18.9,
        morn: 16.3
      },
      feels_like: {
        day: 17.8,
        night: 15.2,
        eve: 18.4,
        morn: 15.9
      },
      pressure: 1018,
      humidity: 70,
      dew_point: 12.8,
      wind_speed: 3.2,
      wind_deg: 220,
      wind_gust: 5.1,
      weather: [
        {
          id: 800,
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }
      ],
      clouds: 5,
      pop: 0.1,
      uvi: 6.5
    }
  ]
};

// Mock response for geocoding API (unchanged)
export const mockGeocodingResponse = [
  {
    name: 'San Francisco',
    local_names: {
      en: 'San Francisco'
    },
    lat: 37.7749295,
    lon: -122.4194155,
    country: 'US',
    state: 'California'
  },
  {
    name: 'San Francisco',
    local_names: {
      en: 'San Francisco'
    },
    lat: 37.0,
    lon: -122.0,
    country: 'US',
    state: 'Texas'
  }
];

// Mock response for weather overview API 3.0 feature
export const mockWeatherOverviewResponse = {
  weather_overview: 'Today will be mostly clear with temperatures reaching 22°C. Light winds from the west at 3 m/s. Perfect conditions for outdoor activities.'
};

// Legacy exports for backwards compatibility (will be removed after test updates)
export const mockCurrentWeatherResponse = mockOneCallCurrentResponse;
export const mockForecastResponse = mockOneCallForecastResponse; 