import {Client, Util} from '../objects';
import type {BaileysEventMap, AuthenticationCreds} from '@adiwajshing/baileys';
import {Context} from '../extends/context';
import {messageCollector, cooldownMiddleware} from '../middleware';
import {devs} from '../config';

const messageUpsertHandle = async (
    client: Client,
    arg: BaileysEventMap<AuthenticationCreds>['messages.upsert'],
) => {
  if (arg.messages.length) {
    const ctx = new Context(client, arg.messages[0], true);
    if (ctx.timestamp < ctx.client.startTime) {
      ctx.client.logger.info(ctx.id +
                ' message was blocked');
      return;
    }

    const collectorActive = await messageCollector(ctx);
    if (!collectorActive) return;

    const cmdName = ctx.getCommandName();
    if (!cmdName) return;
    const cmd = ctx.client.modules.commands.get(
        cmdName.toLowerCase()) || [...ctx.client.modules.commands.values()]
        .find((c) => c.alias?.includes(
            cmdName.toLowerCase()));
    if (cmd) {
      if (cmd.groupOnly && ctx.isPM) return;
      else if (cmd.dmOnly && ctx.isGroup) return;
      else if (cmd.devOnly && !devs.includes(ctx.authorNumber as never)) {
        return;
      }

      const continueExecute = await cooldownMiddleware(ctx);
      if (continueExecute) {
        await cmd.target(ctx);
      }
    }
  }
};

export default Util.makeEventConfig({
  'name': 'messages.upsert',
  'target': messageUpsertHandle,
});
