import type { Awaitable, ClientEvents } from 'discord.js';
import type { PojavClient } from '../util/PojavClient';

export * as guildMemberAdd from './guildMemberAdd';
export * as guildMemberRemove from './guildMemberRemove';
export * as interactionCreate from './interactionCreate';
export * as ready from './ready';

export type PojavEvent<K extends keyof ClientEvents> = {
  listener(client: PojavClient, ...args: ClientEvents[K]): Awaitable<void>;
  once?: true;
};
