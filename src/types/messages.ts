import type {MessageUpdateType, proto} from 'hanif-baileys-md';

export interface MessageUpsert {
    messages: proto.IWebMessageInfo[];
    type: MessageUpdateType;
};
