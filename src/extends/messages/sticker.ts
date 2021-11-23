import {proto} from '@slonbook/baileys-md';
import Long from 'long';

/**
 * @class Sticker
 */
export class Sticker {
  /**
     * @param {proto.StickerMessage} raw - Sticker raw message
     */
  constructor(public raw: proto.IStickerMessage) {}

  /**
     * Get encrypted sticker url
     *
     * @return {string}
     */
  public get encryptedUrl(): string {
    return this.raw.url as string;
  }

  /**
     * Get mimetype of media
     *
     * @return {string}
     */
  public get mimeType(): string {
    return this.raw.mimetype as string;
  }


  /**
     * Get sticker size
     *
     * @return {{height:number,width:number}}
     */
  public get size(): { height: number; width: number } {
    return {
      'height': this.raw.height as number,
      'width': this.raw.width as number,
    };
  }

  /**
     * Get sticker timestamp message
     *
     * @return {number}
     */
  public get timestamp(): number {
    if (this.raw.mediaKeyTimestamp instanceof Long) {
      return this.raw.mediaKeyTimestamp.toInt() * 1000;
    } else return this.raw.mediaKeyTimestamp as number;
  }

  /**
     * Sticker is animated?
     *
     * @return {boolean}
     */
  public get animated(): boolean {
    return this.raw.isAnimated as boolean;
  }

  /**
     * SHA256 sticker file
     *
     * @return {{source: Uint8Array, enc: Uint8Array}}
     */
  public get sha256(): { source: Uint8Array; enc: Uint8Array; } {
    return {
      'source': this.raw.fileSha256 as Uint8Array,
      'enc': this.raw.fileEncSha256 as Uint8Array,
    };
  }

  /**
     * Get mediaKey of sticker file
     *
     * @return {Uint8Array}
     */
  public get key(): Uint8Array {
    return this.raw.mediaKey as Uint8Array;
  }

  /**
     * Get file size of sticker
     *
     * @return {number}
     */
  public get fileSize(): number {
    if (this.raw.fileLength instanceof Long) {
      return this.raw.fileLength.toInt() * 1024;
    } else return this.raw.fileLength as number;
  }
}
