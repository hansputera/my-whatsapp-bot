import type {MessageUpdateType, proto} from '@slonbook/baileys-md';

export interface MessageUpsert {
    messages: proto.IWebMessageInfo[];
    type: MessageUpdateType;
};
