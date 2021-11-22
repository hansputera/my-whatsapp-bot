import {Context} from '../extends/context';

export const messageCollector = async (
    ctx: Context,
) => {
  const collectorSession = ctx.client.collectors.get(
      ctx.authorNumber + '-' + ctx.currentJid(),
  );

  if (collectorSession &&
            collectorSession.contexts.length >=
                collectorSession.maxMessages) {
    collectorSession.destroy();
  }

  if (collectorSession && collectorSession.validate(ctx)) {
    collectorSession.events.emit('new', ctx);
    collectorSession.contexts.push(ctx);
    return false;
  } else {
    return true;
  }
};
