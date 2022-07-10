import { Client, Collection } from 'discord.js';
import * as CommandsModule from '../commands';
import * as EventsModule from '../events';

export class PojavClient extends Client<true> {
  public commands = new Collection<string, CommandsModule.PojavCommand>();
  public override login(token?: string) {
    for (const [commandName, { command }] of Object.entries(CommandsModule)) {
      this.commands.set(commandName, command);
    }
    for (const [eventName, { event }] of Object.entries(EventsModule)) {
      if (event.once) {
        this.once(eventName, event.listener);
      } else {
        this.on(eventName, event.listener);
      }
    }

    return super.login(token);
  }
}
