import {Client} from '../objects';
import {proto, AnyMessageContent, GroupParticipant} from 'hanif-baileys-md';
import Long from 'long';
import {prefixes} from '../config';
import {MessageCollector} from './collector';
import {CommandInfo, CollectorOptions} from '../types';
import {createLogger} from '../objects';
import {Sticker, Image, Video} from './messages';
import {GroupContext} from './group';

/**
 * @class Context
 */
export class Context {
  public logger = createLogger('context-' + this.id);
  /**
     * @param {Client} client
     * @param {proto.IWebMessageInfo} msg
     * @param {boolean} groupSync
     */
  constructor(
      public client: Client,
      public msg: proto.IWebMessageInfo,
      groupSync?: boolean) {
    this.reloadQuery();
    if (groupSync) this.syncGroup();
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
   * Get group context data (if any)
   *
   * @return {GroupContext | undefined}
   */
  public getGroup(): GroupContext | undefined {
    return this.client.groupsCache.get(
        this.currentJid() + '@g.us',
    );
  }

  /**
   * Get the arguments of message (only available if it is a command)
   *
   * @param {boolean} withPrefix
   * @return {string[]}
   */
  public getArgs(withPrefix: boolean = false): string[] {
    if (!this.isCommand()) return [];
    let text = this.text;
    const extendedMessage = this.msg.message?.extendedTextMessage;

    if (extendedMessage && extendedMessage.contextInfo &&
            extendedMessage.contextInfo.quotedMessage) {
      text += ' ' +
                    extendedMessage.contextInfo
                        .quotedMessage.conversation;
    }

    return text.slice(this.getPrefix().length)
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
  private reloadQuery(): { args: string[]; flags: string[]; } {
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
   * Get replied message from this message
   *
   * @return {ContextInfo | undefined}
   */
  public getReply(): ContextInfo | undefined {
    if (this.msg.message?.extendedTextMessage &&
            this.msg.message.extendedTextMessage.contextInfo) {
      return new ContextInfo(
          this.msg.message.extendedTextMessage.contextInfo,
          this.currentJid(),
          this.client,
      );
    }
    return undefined;
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
    return this.msg.key.participant ?
            this.msg.key.participant.replace(
                /\@.+/gi, '',
            ) :
            (this.isFromMe ?
                this.client.baileys.user.id
                    .replace(/\@.+/gi, '').split(':')[0] :
                    this.currentJid());
  }

  /**
   * Get collector instance.
   * @param {CollectorOptions} options - Message Collector options.
   * @return {MessageCollector}
   */
  public getCollector(options?: CollectorOptions): MessageCollector {
    return new MessageCollector(this, options);
  }

  /**
   * Get GroupParticipant class.
   *
   * @return {GroupParticipant | undefined}
   */
  public get participant(): GroupParticipant | undefined {
    if (!this.isGroup) return undefined;
    else if (this.isGroup && !this.client.groupsCache.has(
          this.msg.key.remoteJid as string,
    )) return undefined;

    return this.client.groupsCache.get(
        this.msg.key.remoteJid as string,
    )?.members.find((m) => m.id === this.authorNumber);
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
   * Identify is it a group?
   *
   * @return {boolean}
   */
  public get isGroup(): boolean {
    return !((this.authorNumber as string) ===
        this.currentJid());
  }

  /**
   * Identify is it a private message?.
   *
   * @return {boolean}
   */
  public get isPM(): boolean {
    return !this.isGroup;
  }

  /**
   * Get sticker from this message
   *
   * @return {Sticker | undefined}
   */
  public get sticker(): Sticker | undefined {
    if (this.msg.message?.stickerMessage) {
      return new Sticker(
          this.msg.message.stickerMessage);
    } else return undefined;
  }

  /**
   * Get an image from this message
   *
   * @return {Image | undefined}
   */
  public get image(): Image | undefined {
    if (this.msg.message?.imageMessage) {
      return new Image(
          this.msg.message.imageMessage);
    } else return undefined;
  }

  /**
   * Get a video from this message
   *
   * @return {Video | undefined}
   */
  public get video(): Video | undefined {
    if (this.msg.message?.videoMessage) {
      return new Video(
          this.msg.message.videoMessage,
      );
    } else return undefined;
  }

  /**
     * Get the message text content
     * @return {string}
     */
  public get text(): string {
    if (this.msg.message?.extendedTextMessage) {
      return this.msg.message.extendedTextMessage.text as string;
    } else if (this.image && this.image.caption) {
      return this.image.caption;
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
    try {
      return new Context(this.client, await this.client.baileys.sendMessage(
                this.msg.key.remoteJid as string, {
                  'text': text,
                  ...anotherOptions,
                }, {
                  quoted: this.msg,
                },
      ));
    } catch (e) {
      this.logger.error('Error to send a message: ' + text, e);
      return undefined;
    }
  }

  /**
   * Reply a message with audio
   * @param {Buffer | string} audio - URL/Buffer audio
   * @param {boolean} isVN - Is it voice note?
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async replyWithAudio(audio: Buffer | string,
      isVN: boolean = false, anotherOptions?: AnyMessageContent) {
    try {
      return new Context(this.client, await this.client.baileys.sendMessage(
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
      ));
    } catch (e) {
      this.logger.error('Error want to send a message: AUDIO', e);
      return undefined;
    }
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
    try {
      return new Context(this.client, await this.client.baileys.sendMessage(
            this.msg.key.remoteJid as string, {
              'video': typeof video === 'string' ?
                    {
                      'url': video,
                    } : video,
              ...anotherOptions,
            }, {
              'quoted': this.msg,
            },
      ));
    } catch (e) {
      this.logger.error('Error want to send a message: VIDEO', e);
      return undefined;
    }
  }

  /**
   * Only send a message without reply.
   *
   * @param {string} text - Send a text
   * @param {AnyMessageContent} anotherOptions - Send message options
   */
  public async send(text: string, anotherOptions?: AnyMessageContent) {
    try {
      return new Context(this.client, await this.client.baileys.sendMessage(
            this.msg.key.remoteJid as string, {
              'text': text,
              ...anotherOptions,
            },
      ));
    } catch (e) {
      this.logger.error('Error want to send a message: NORMAL TEXT', e);
      return undefined;
    }
  }

  /**
   * Reply a message with photo
   *
   * @param {Buffer | string} photo - A Photo
   * @param {string?} caption - A Photo caption
   * @param {AnyMessageContent?} anotherOptions - Send message options
   */
  public async replyWithPhoto(photo: Buffer | string,
      caption?: string, anotherOptions?: AnyMessageContent) {
    if (!anotherOptions) (anotherOptions as unknown) = {};
    if (caption) {
      (anotherOptions as Record<string, unknown>)['caption'] =
          caption;
    }
    try {
      return new Context(this.client, await this.client.baileys.sendMessage(
            this.msg.key.remoteJid as string, {
              'image': typeof photo === 'string' ?
                    {'url': photo} : photo,
              'mimetype': 'image/png',
              ...anotherOptions,
            }, {
              'quoted': this.msg,
            },
      ));
    } catch (e) {
      this.logger.error('Error want to send a message: PHOTO', e);
      return undefined;
    }
  }

  /**
   * Reply a message using sticker
   *
   * @param {Buffer | string} sticker
   */
  public async replyWithSticker(sticker: Buffer | string) {
    try {
      return new Context(this.client, await this.client.baileys.sendMessage(
          this.msg.key.remoteJid as string, {
            'sticker': typeof sticker === 'string' ?
                {
                  'url': sticker,
                } : sticker,
          }, {
            'quoted': this.msg,
          },
      ));
    } catch (e) {
      this.logger.error('Error want to send a message: STICKER', e);
      return undefined;
    }
  }

  /**
   * Delete this message
   */
  public async delete() {
    try {
      return await this.client.baileys.sendMessage(
          this.msg.key.remoteJid as string, {
            'delete': this.msg.key,
          },
      );
    } catch (e) {
      this.logger.error('Error want to delete a message: ', e);
      return undefined;
    }
  }

  /**
   * If the chat is in a group, add it to cache.
   *
   * @return {Promise<boolean>}
   */
  public async syncGroup(): Promise<boolean> {
    if (!this.isGroup ||
            this.client.groupsCache.has(
                this.msg.key.remoteJid as string,
            )) return false;

    const groupMeta = await this
        .client.baileys.groupMetadata(
            this.msg.key.remoteJid as string,
        );

    this.client.groupsCache.set(this.msg.key.remoteJid as string,
        new GroupContext(this.client, groupMeta));
    return true;
  }
}


/**
 * @class ContextInfo
 */
export class ContextInfo extends Context {
  /**
       *
       * @param {proto.IContextInfo} raw - Context Info
       * @param {string} remoteJid - Remote JID
       * @param {Client} client - Bot Client
       */
  constructor(raw: proto.IContextInfo, remoteJid: string, client: Client) {
    super(client, {
      'key': {
        'fromMe': client.baileys.user.id
            .replace(/\@.+/gi, '').split(':')[0] ===
                          raw.participant?.replace(/\@.+/gi, ''),
        'id': raw.stanzaId,
        'remoteJid': remoteJid,
      },
      'message': raw.quotedMessage,
      'messageTimestamp': Date.now(),
    });
  }
}

