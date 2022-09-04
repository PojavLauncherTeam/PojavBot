import process from 'node:process';
import { Client, Collection } from 'discord.js';
import * as CommandsModule from '../commands';
import * as EventsModule from '../events';
import { DatabaseClient } from './DatabaseClient';
import { LocalizationManager } from './LocalizationManager';

export class PojavClient extends Client<true> {
  public commands = new Collection<string, CommandsModule.PojavChatInputCommand>();

  public database = new DatabaseClient(process.env.MONGO_URL!);

  public localizations = new LocalizationManager();

  public override async login(token?: string) {
    await Promise.all([this.database.mongo.connect(), this.localizations.load()]);

    for (const [commandName, { command }] of Object.entries(CommandsModule)) {
      this.commands.set(commandName, command);
    }

    for (const [eventName, { event }] of Object.entries(EventsModule)) {
      if (event.once) {
        this.once(eventName, (...args) => event.listener(this, ...args));
      } else {
        this.on(eventName, (...args) => event.listener(this, ...args));
      }
    }

    return super.login(token);
  }
}
