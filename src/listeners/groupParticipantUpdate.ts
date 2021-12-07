import { Client, Util } from "../objects";
import { BaileysEventMap } from "@slonbook/baileys-md";

const groupParticipantUpdateHandle = async (
    client: Client,
    arg: BaileysEventMap['group-participants.update'],
) => {
    const group = client.groupsCache.get(
        arg.id
    );

    if (group && arg.action === 'remove' &&
        arg.participants.includes(client.baileys.user.id
                .replace(':1', ''))) {
            client.logger.info(
                'Got kicked from: ' + group.name,
            );
            client.groupsCache.delete(arg.id);

            if (client.youtubeStreams.has(arg.id)) {
                client.youtubeStreams.get(
                    arg.id
                )?.destroy(new Error('leaved'));
            }

            const gCollectors = [...client.collectors.keys()]
                .filter((key) => key.includes(arg.id.replace(
                    /\@.+/gi, ''
                )));
            if (gCollectors.length) {
                gCollectors.forEach((gCollector) => {
                    client.logger.warn(
                        'Collector for: ' + gCollector +
                            ' has removed because ge' +
                                'tting kicked from the group!'
                    );
                    client.collectors.get(gCollector)?.destroy();
                });
            }
    }
};

export default Util.makeEventConfig({
    'name': 'group-participants.update',
    'target': groupParticipantUpdateHandle,
});
