import {GroupMetadata} from '@slonbook/baileys-md';
import {Client} from '../objects';
import {GroupContext} from '../extends/group';

/**
 * Group Upsert Event
 * @param {Client} client
 * @param {GroupMetadata[]} groups
 * @return {Promise<void>}
 */
export const groupUpsertEvent =
async (client: Client, groups: GroupMetadata[]):
    Promise<void> => {
  if (!groups.length) return;
  const group = new GroupContext(client, groups[0]);

  console.log(group.name);
};

