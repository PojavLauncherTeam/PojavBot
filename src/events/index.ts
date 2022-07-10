import type { Awaitable, ClientEvents } from 'discord.js';

export * as ready from './ready';

export interface PojavEvent<K extends keyof ClientEvents> {
  once?: true;
  listener(...args: ClientEvents[K]): Awaitable<void>;
}
