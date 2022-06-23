import type { MessageUpdateType, proto } from '@adiwajshing/baileys';

export interface MessageUpsert {
	messages: proto.IWebMessageInfo[];
	type: MessageUpdateType;
}
