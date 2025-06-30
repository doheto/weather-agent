import { CalendarEvent, WeatherAlert } from '../entities/CalendarEvent';

export interface ICalendarPort {
  getUpcomingEvents(timeframe: string, maxEvents?: number): Promise<CalendarEvent[]>;
  extractLocationsFromEvents(events: CalendarEvent[]): Promise<string[]>;
  createWeatherAlert(event: CalendarEvent, weatherCondition: string): Promise<WeatherAlert>;
  addWeatherToEventDescription(eventId: string, weatherInfo: string): Promise<boolean>;
  getEventsForLocation(location: string, timeframe: string): Promise<CalendarEvent[]>;
} 