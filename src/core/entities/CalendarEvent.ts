export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: EventLocation;
  attendees?: string[];
  organizer: string;
}

export interface EventLocation {
  name: string;
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface WeatherAlert {
  eventId: string;
  eventTitle: string;
  location: string;
  weatherCondition: string;
  alertType: AlertType;
  message: string;
  timestamp: Date;
}

export enum AlertType {
  RAIN_WARNING = 'rain_warning',
  TEMPERATURE_EXTREME = 'temperature_extreme',
  WIND_WARNING = 'wind_warning',
  GENERAL_ADVISORY = 'general_advisory'
} 