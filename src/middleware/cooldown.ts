import {Context} from '../extends/context';
import {redis} from '../db/redis';

export const cooldownMiddleware = async (
    ctx: Context,
) => {
  if (!ctx.authorNumber) return false;
  const user = await redis.get('cooldown-' + ctx.authorNumber as string);
  if (user && JSON.parse(user).cooldown >= Date.now()) {
    if (!JSON.parse(user).warned) {
      await redis.set('cooldown-' + ctx.authorNumber as string,
          JSON.stringify({
            'cooldown': JSON.parse(user).cooldown,
            'warned': true,
          }));
      await ctx.reply('You\'re in a cooldown mode, please wait.');
    }
    return false;
  }
  const command = ctx.command;

  if (command && command.cooldown) {
    await redis.set('cooldown-' + ctx.authorNumber as string,
        JSON.stringify({
          'cooldown': Date.now() + command.cooldown,
          'warned': false,
        }), 'px', command.cooldown);

    return true;
  }
};
