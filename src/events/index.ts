import {Client} from '../objects';
import {MessageUpsert} from '../types';
import {messageUpsertEvent} from './messageUpsert';

/**
 * @class EventHandler
 */
export class EventHandler {
  /**
     * @param {Client} client
     */
  constructor(private client: Client) {}

  /**
     * @param {MessageUpsert} data
     * @return {Promise<void>}
     */
  messageUpsert(data: MessageUpsert): Promise<void> {
    return messageUpsertEvent(this.client, data);
  }
}
