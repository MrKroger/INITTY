import { EventEmitter } from "events";

const globalForEventEmitter = global as unknown as { eventEmitter: EventEmitter };

const eventEmitter = globalForEventEmitter.eventEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  globalForEventEmitter.eventEmitter = eventEmitter;
}

export { eventEmitter };