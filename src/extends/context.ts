import {Client} from '../objects';
import {proto, AnyMessageContent} from '@slonbook/baileys-md';
import Long = require('long');
import { prefixes } from '../config';

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
   * Get the arguments of message (only available if it is a command)
   * 
   * @return {string[]}
   */
  public get args(): string[] {
      if (!this.isCommand()) return [];

      return this.text.slice(this.getPrefix().length)
        .split(/ +/g).slice(1);      
  }

  /**
   * Get the prefix from the message
   * 
   * @return {string}
   */
  public getPrefix(): string {
      if (!this.text) return '';
      for (const prefix of prefixes) {
          if (this.text.startsWith
            (prefix.toLowerCase())) return prefix;
      }

      return '';
  }

  /**
   * Knows the message is command.
   * 
   * @return {boolean}
   */
  public isCommand(): boolean {
      if (!this.text) return false;
      else return this.getPrefix().length > 0;
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
     * @return {number}
     */
  public get timestamp(): number {
      if (this.msg.messageTimestamp instanceof Long) {
          return this.msg.messageTimestamp.toInt() * 1000;
      } else return this.msg.messageTimestamp as number;
  }

  /**
     * Reply the message
     *
     * @param {string} text - Text Content
     * @param {AnyMessageContent} anotherOptions - Send message options
     */
  public async reply(text: string, anotherOptions?: AnyMessageContent) {
    return await this.client.baileys.sendMessage(
            this.msg.key.remoteJid as string, {
              'text': text,
              ...anotherOptions,
            }, {
                quoted: this.msg,
            }
    );
  }
}
