import type { PojavEvent } from '.';

export const event: PojavEvent<'ready'> = {
  listener(client) {
    client.application.commands.set(client.commands.map((command) => command.data.toJSON()));
    console.log('Ready!');
  },
};
