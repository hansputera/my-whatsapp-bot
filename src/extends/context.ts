import {Client} from '../objects';
import {proto, AnyMessageContent} from '@slonbook/baileys-md';

/**
 * @class Context
 */
export class Context {
  /**
     * @param {Client} client
     * @param {proto.IWebMessageInfo} msg
     */
  constructor(public client: Client, public msg: proto.IWebMessageInfo) {}

  /**
     * Message ID
     * @return {string}
     */
  public get id(): string {
    return this.msg.key.id as string;
  }

  /**
     * Is the message from me?
     * @return {boolean}
     */
  public get isFromMe(): boolean {
    return this.msg.key.fromMe as boolean;
  }

  /**
     * Get message author number
     * @return {string}
     */
  public get authorNumber(): string | undefined {
    return this.msg.participant ?
            this.msg.participant.split('@')[0] :
            undefined;
  }

  /**
     * Get the message text content
     * @return {string}
     */
  public get text(): string {
    return this.msg.message?.conversation as string;
  }

  /**
     * Get the timestamp message
     * @return {Long.Long | number}
     */
  public get timestamp(): Long.Long | number {
    return this.msg.messageTimestamp as Long.Long | number;
  }

  /**
     * Reply the message
     *
     * @param {AnyMessageContent} content
     */
  public async reply(text: string, anotherOptions?: AnyMessageContent) {
    return await this.client.baileys.sendMessage(
            this.msg.key.remoteJid as string, {
                'text': text,
                ...anotherOptions,
            }
    );
  }
}
