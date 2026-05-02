class EventBus {
  constructor() {
    if (EventBus.instance) {
      return EventBus.instance;
    }
    
    this.events = new Map();
    EventBus.instance = this;
    return this;
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    if (!this.events.has(event)) return;
    this.events.get(event).delete(callback);
    
    if (this.events.get(event).size === 0) {
      this.events.delete(event);
    }
  }

  emit(event, ...args) {
    if (!this.events.has(event)) return;
    this.events.get(event).forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Ошибка в обработчике события "${event}":`, error);
      }
    });
  }

  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

export default new EventBus();