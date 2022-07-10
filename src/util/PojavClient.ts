import { Client } from 'discord.js';
import * as EventsModule from '../events';

export class PojavClient extends Client {
  public override login(token?: string) {
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
