import {Context} from '../extends/context';
import {Client} from '../objects';
import {MessageUpsert} from '../types';

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
                ' message was blocked because indicates as pending notification message');
            return;
        }

        if (!ctx.isCommand()) return;
        const cmd = ctx.client.modules.commands.get
            (ctx.text.toLowerCase()) || [...ctx.client.modules.commands.values()]
                .find((c) => c.alias?.includes(
                    ctx.text.toLowerCase()));
        if (cmd) {
            await cmd.target(ctx);
        }
      }
    };
