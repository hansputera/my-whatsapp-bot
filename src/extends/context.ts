import {Client} from '../objects';
import {proto, AnyMessageContent} from '@slonbook/baileys-md';
import Long from 'long';
import {prefixes} from '../config';
import {CommandInfo} from '../types';

/**
 * @class Context
 */
export class Context {
  /**
     * @param {Client} client
     * @param {proto.IWebMessageInfo} msg
     */
  constructor(public client: Client, public msg: proto.IWebMessageInfo) {
    this.parseQuery();
  }

  public args: string[] = [];
  public flags: string[] = [];

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
   * @param {boolean} withPrefix
   * @return {string[]}
   */
  public getArgs(withPrefix: boolean = false): string[] {
    if (!this.isCommand()) return [];

    return this.text.slice(this.getPrefix().length)
        .split(/ +/g).slice(withPrefix ? 0 : 1);
  }

  /**
   * Get the command name from message
   *
   * @return {string}
   */
  public getCommandName(): string {
    return this.getArgs(true)[0];
  }

  /**
   * Parse message to args and flags
   *
   * @return {{args: string[], flags: string[]}}
   */
  private parseQuery(): { args: string[]; flags: string[]; } {
    this.args = [];
    this.flags = [];

    for (const q of this.getArgs()) {
      if (q.startsWith('--')) this.flags.push(q.slice(2).toLowerCase());
      else this.args.push(q);
    }

    return {args: this.args, flags: this.flags};
  }

  /**
   * Get the command data from message
   *
   * @return {CommandInfo | undefined}
   */
  public get command(): CommandInfo | undefined {
    const cmd = this.getCommandName();
    if (!cmd) return undefined;

    return this.client.modules.commands.get(
        cmd.toLowerCase()) ||
        [...this.client.modules.commands.values()]
            .find((c) => c.alias?.includes(
                cmd.toLowerCase()));
  }

  /**
   * Get the prefix from the message
   *
   * @return {string}
   */
  public getPrefix(): string {
    if (!this.text) return '';
    const p = prefixes.find((p) => this.text.startsWith(
        p.toLowerCase()),
    );

    return p ? p : '';
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
            this.msg.participant.replace(
                /\@.+/gi, '',
            ) :
            (this.isFromMe ?
                this.client.baileys.user.id
                    .replace(/\@.+/gi, '').split(':')[0] :
                    this.currentJid());
  }

  /**
   * Get current jid id
   *
   * @return {string}
   */
  public currentJid(): string {
    return this.msg.key.remoteJid ?
        this.msg.key.remoteJid.replace(
            /\@.+/gi, '',
        ) : '';
  }

  /**
     * Get the message text content
     * @return {string}
     */
  public get text(): string {
    if (this.msg.message?.extendedTextMessage) {
      return this.msg.message.extendedTextMessage.text as string;
    }
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
            },
    );
  }

  /**
   * Reply a message with audio
   * @param {Buffer | string} audio - URL/Buffer audio
   * @param {boolean} isVN - Is it voice note?
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async replyWithAudio(audio: Buffer | string,
      isVN: boolean = false, anotherOptions?: AnyMessageContent) {
    return await this.client.baileys.sendMessage(
          this.msg.key.remoteJid as string, {
            'audio': typeof audio === 'string' ?
                {
                  'url': audio,
                } : audio,
            'pttAudio': isVN,
            ...anotherOptions,
          }, {
            'quoted': this.msg,
          },
    );
  }

  /**
   * Reply a message with video
   *
   * @param {Buffer | string} video - Video source want to send.
   * @param {string?} caption - Video caption
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async replyWithVideo(video: Buffer | string,
      caption?: string, anotherOptions?: AnyMessageContent) {
    if (!anotherOptions) {
      (anotherOptions as unknown) = {};
    }
    if (caption) {
      (anotherOptions as Record<string, unknown>)['caption'] =
        caption;
    }
    return await this.client.baileys.sendMessage(
          this.msg.key.remoteJid as string, {
            'video': typeof video === 'string' ?
                {
                  'url': video,
                } : video,
            ...anotherOptions,
          }, {
            'quoted': this.msg,
          },
    );
  }

  /**
   * Only send a message without reply.
   *
   * @param {string} text - Send a text
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async send(text: string, anotherOptions?: AnyMessageContent) {
    return await this.client.baileys.sendMessage(
          this.msg.key.remoteJid as string, {
            'text': text,
            ...anotherOptions,
          },
    );
  }
}
