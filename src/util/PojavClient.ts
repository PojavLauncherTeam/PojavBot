import { Client, Collection } from 'discord.js';
import * as CommandsModule from '../commands';
import * as EventsModule from '../events';
import { DatabaseClient } from './DatabaseClient';

export class PojavClient extends Client<true> {
  public commands = new Collection<string, CommandsModule.PojavChatInputCommand>();
  public database = new DatabaseClient(process.env.MONGO_URL!);

  public override async login(token?: string) {
    await this.database.mongo.connect();

    for (const [commandName, { command }] of Object.entries(CommandsModule)) {
      this.commands.set(commandName, command);
    }
    for (const [eventName, { event }] of Object.entries(EventsModule)) {
      if (event.once) {
        // @ts-ignore
        this.once(eventName, (...args) => event.listener(this, ...args));
      } else {
        // @ts-ignore
        this.on(eventName, (...args) => event.listener(this, ...args));
      }
    }

    return super.login(token);
  }
}
