import got from 'got';
import {
  MediaType,
  getMediaKeys,
} from '@adiwajshing/baileys';
import prettyMs from 'pretty-ms';
import {CommandInfo, EventInfo} from '../types';
import {createDecipheriv} from 'crypto';
import {Transform} from 'node:stream';

/**
 * @class Util
 */
export class Util {
  public static fetch = got;
  /**
     * Use this method if you want post a text to the hastebin site.
     * @param {string} text - A text want to post.
     * @return {Promise<string>}
     */
  static async postToHastebin(text: string): Promise<string> {
    const response = await got.post(
        'https://www.toptal.com/developers/hastebin/documents', {
          'body': text,
        });
    return 'https://www.toptal.com/developers/hastebin/raw/' +
     JSON.parse(response.body).key;
  }


  /**
   * @param {CommandInfo} data - Command data
   * @return {CommandInfo}
   */
  static makeCommandConfig(data: CommandInfo): CommandInfo {
    return data;
  }

  /**
   * @param {CommandInfo} data - Event data
   * @return {EventInfo}
   */
  static makeEventConfig(data: EventInfo): EventInfo {
    return data;
  }

  /**
   * Parse a duration in miliseconds to human readable.
   *
   * @param {number} ms
   * @param {prettyMs.Options} options
   * @return {string}
   */
  static parseDuration(ms: number, options?: prettyMs.Options): string {
    return prettyMs(ms, {
      colonNotation: true,
      secondsDecimalDigits: 0,
      ...options,
    });
  }

  /**
   * @param {string} url
   * @param {Uint8Array} mediaKey
   * @param {MediaType} type
   *
   * @return {Transform}
   */
  static decryptMedia(
      url: string,
      mediaKey: Uint8Array,
      type: MediaType): Transform {
    // source: https://github.com/adiwajshing/baileys.git
    const responseMedia = this.fetch(url, {'isStream': true});
    let remainBytes = Buffer.from([]);

    const {cipherKey, iv} = getMediaKeys(mediaKey, type);
    const aes = createDecipheriv('aes-256-cbc', cipherKey, iv);
    aes.setAutoPadding(false); // https://github.com/nodejs/node/issues/2794

    const pipeHandler = new Transform({
      transform(chunk, _, callback) {
        let data = Buffer.concat([remainBytes, chunk]);
        const decryptLength =
                    Math.floor(data.length / 16) * 16;
        remainBytes = data.slice(decryptLength);
        data = data.slice(0, decryptLength);

        try {
          this.push(aes.update(data));
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
      final(callback) {
        try {
          this.push(aes.final());
          callback();
        } catch (error) {
          callback(error as Error);
        }
      },
    });

    return responseMedia.pipe(pipeHandler, {end: true});
  }

  /**
   * @param {string} text
   * @return {string}
   */
  static mockText(text: string): string {
    const letters: string[] =
        text.split('');

    for (let i = 0; i < letters.length; i += Math.floor(Math.random() * 4)) {
      letters[i] = letters[i].toUpperCase();
    }


    return letters.join('');
  }

  /**
   * @param {unknown[]} array
   * @param {number?} length
   * @return {T[]}
   */
  static trimArray<T>(array: T[], length: number = 10): T[] {
    const temp = array.slice(0, array.length - length);
    temp.push((
          '...' +
            (array.length - length).toString() +
                ' more') as unknown as T);
    return temp;
  }
}
