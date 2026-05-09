import { ForecastData } from "../../types/forecast";
import { WeatherModelSnapshot } from "../../types/weathermodelsnapshot";
import { StorageData } from "../../types/storagedata";

export interface PromiseResult {
  success: boolean;
  error: Error | null;
  data: unknown;
}

export type EventBusHandlerTypes = Record<string, string> | Record<string, number> | string | boolean | null | Error |
  ForecastData | ForecastData[] |
  WeatherModelSnapshot |
  StorageData;
type EventBusHandler = (params?: EventBusHandlerTypes) => void | Promise<PromiseResult> | Promise<void>;

class EventBus {
  private static instance: EventBus;
  private events: Map<string, Set<EventBusHandler>>;

  private constructor() {
    this.events = new Map();
  }

  static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  on(event: string, callback: EventBusHandler) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event)?.add(callback);
    return () => this.off(event, callback);
  }

  off(event: string, callback: EventBusHandler) {
    if (!this.events.has(event)) return;
    this.events.get(event)?.delete(callback);

    if (this.events.get(event)?.size === 0) {
      this.events.delete(event);
    }
  }

  emit(event: string, args: EventBusHandlerTypes = null) {
    if (!this.events.has(event)) return;
    this.events.get(event)?.forEach(callback => {
      try {
        callback(args);
      } catch (error) {
        console.error(`Ошибка в обработчике события "${event}":`, error);
      }
    });
  }

  clear(event: string) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

const eventBus = EventBus.getInstance();
export default eventBus; 