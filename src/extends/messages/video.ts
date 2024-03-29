import {MessageMediaBase} from '.';
import {proto} from '@adiwajshing/baileys';
import {Util} from '../../objects';

/**
 * TODO:
 *
 * - Add thumbnail and decrypt it.
 */

/**
 * @class Video
 */
export class Video extends MessageMediaBase {
  /**
     * @param {proto.IVideoMessage} raw
     */
  constructor(public raw: proto.IVideoMessage) {
    super(raw);
  }

  /**
   * Playback video?
   *
   * @return {boolean}
   */
  public get playback(): boolean {
    return Boolean(this.raw.gifPlayback);
  }

  /**
   * Get seconds duration from a message
   *
   * @return {number}
   */
  public get seconds(): number {
    return this.raw.seconds as number;
  }

  /**
   * Get caption from the video
   *
   * @return {string | undefined}
   */
  public get caption(): string | undefined {
    return this.raw.caption as string ?? undefined;
  }

  /**
     * Get image video
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
   * Fetch encrypted url video file.
   *
   * @return {Promise<Buffer>}
   */
  public async retrieveFile(): Promise<Buffer> {
    return await new Promise((resolve) => {
      let buffer = Buffer.alloc(0);
      const stream = Util.decryptMedia(this.encryptedUrl, this.key, 'video');
      stream.on('data', (chunk) => {
        buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      });

      stream.on('end', () => resolve(buffer));
    });
  }
}
