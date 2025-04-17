class EventEmitter {
  constructor() {
    this.events = {};
  }

  // Register an event listener for a specific event
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    return listener;
  }

  // Remove a specific event listener
  off(event, listener) {
    if (!this.events[event]) return;

    const index = this.events[event].indexOf(listener);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  // Trigger an event, calling all registered listeners for the event
  emit(event, ...args) {
    if (!this.events[event]) return;

    this.events[event].forEach((listener) => {
      listener(...args);
    });
  }
}