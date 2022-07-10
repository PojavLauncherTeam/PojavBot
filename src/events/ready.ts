import type { PojavEvent } from '.';

export const event: PojavEvent<'ready'> = {
  listener() {
    console.log('Ready!');
  },
};
