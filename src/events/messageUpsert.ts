import {Context} from '../extends/context';
import {Client} from '../objects';
import {MessageUpsert} from '../types';
import {cooldownMiddleware, messageCollector} from '../middleware';

/**
 * Message Upsert Event Handler
 *
 * @param {Client} client
 * @param {MessageUpsert} data
 */
export const messageUpsertEvent =
    async (client: Client, data: MessageUpsert) => {
      if (data.messages.length) {
        const ctx = new Context(client, data.messages[0]);
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
          const continueExecute = await cooldownMiddleware(ctx);
          if (continueExecute) {
            await cmd.target(ctx);
          }
        }
      }
    };
