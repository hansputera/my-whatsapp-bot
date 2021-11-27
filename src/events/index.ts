import {Client} from '../objects';
import {MessageUpsert} from '../types';
import {messageUpsertEvent} from './messageUpsert';
import {GroupMetadata} from '@slonbook/baileys-md';
import {groupUpsertEvent} from './groupUpsert';
import {groupUpdateEvent} from './groupUpdate';

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

  /**
   * @param {GroupMetadata[]} data
   * @return {Promise<void>}
   */
  groupUpsert(data: GroupMetadata[]): Promise<void> {
    return groupUpsertEvent(this.client, data);
  }

  /**
   * @param {GroupMetadata[]} data
   * @return {Promise<void>}
   */
  groupUpdate(data: Partial<GroupMetadata>[]): Promise<void> {
    return groupUpdateEvent(this.client, data);
  }
}
