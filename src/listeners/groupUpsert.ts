import {Client, Util} from '../objects';
import {BaileysEventMap} from 'hanif-baileys-md';
import {GroupContext} from '../extends/group';

const groupUpsertHandle = async (
    client: Client,
    arg: BaileysEventMap['groups.upsert'],
) => {
  if (arg.length) {
    const group = new GroupContext(client, arg[0]);
    client.groupsCache.set(group.jid, group);

    if (!group.restricted) {
      client.logger.info('Invited to group: ' + group.name);
      await group.send({'text': 'Hi!'});
    }
  }
};

export default Util.makeEventConfig({
  'name': 'groups.upsert',
  'target': groupUpsertHandle,
});
