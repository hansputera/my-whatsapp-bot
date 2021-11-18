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
        await ctx.reply('apalo');
      }
    };
