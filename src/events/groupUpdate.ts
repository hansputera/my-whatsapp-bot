import {GroupMetadata} from '@slonbook/baileys-md';
import {Client} from '../objects';
import {GroupContext} from '../extends/group';

/**
 * Group Update Event
 * @param {Client} client
 * @param {GroupMetadata[]} groups
 * @return {Promise<void>}
 */
export const groupUpdateEvent =
async (client: Client, groups: Partial<GroupMetadata>[]):
    Promise<void> => {
  if (!groups.length) return;
  const group = new GroupContext(client, groups[0] as GroupMetadata);

  console.log(group.name);
};

