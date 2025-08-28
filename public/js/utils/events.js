// Tiny event emitter for the store and components
export class Emitter {
  constructor() { this.events = new Map(); }
  on(name, fn) {
    if (!this.events.has(name)) this.events.set(name, new Set());
    this.events.get(name).add(fn);
    return () => this.off(name, fn);
  }
  off(name, fn) {
    const set = this.events.get(name);
    if (set) set.delete(fn);
  }
  emit(name, payload) {
    const set = this.events.get(name);
    if (set) for (const fn of Array.from(set)) try { fn(payload); } catch {}
  }
}
