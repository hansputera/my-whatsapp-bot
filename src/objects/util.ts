import got from 'got';
import {
  AuthenticationState, BufferJSON,
  initInMemoryKeyStore,
  MediaType,
  getMediaKeys,
} from '@slonbook/baileys-md';
import {resolve as resolvePath} from 'node:path';
import {readFileSync, writeFileSync} from 'node:fs';
import {CommandInfo} from '../types';
import {createDecipheriv} from 'crypto';
import {Transform} from 'node:stream';

const authPath = resolvePath(__dirname, '..', '..', 'auth.json');
/**
 * @class Util
 */
export class Util {
  public static fetch = got;
  /**
     * Use this method if you want post a text to the hastebin site.
     * @param {string} text - A text want to post.
     * @return {string}
     */
  static async postToHastebin(text: string) {
    const response = await got.post(
        'https://www.toptal.com/developers/hastebin/documents', {
          'body': text,
        });
    return 'https://www.toptal.com/developers/hastebin/raw/' +
     JSON.parse(response.body).key;
  }

  /**
   * Use this method if you want get the authentication state.
   * @return {AuthenticationState}
   */
  static loadAuthState() {
    let state: AuthenticationState | undefined;
    try {
      const st = JSON.parse(readFileSync(authPath, 'utf-8'),
          BufferJSON.reviver);
      state = {
        'creds': st.creds,
        'keys': initInMemoryKeyStore(st.keys),
      };
    } catch {};
    return state;
  }

  /**
   * Use this method if you want save a auth state.
   * @param {AuthenticationState} st - Baileys AS
   * @return {void}
   */
  static saveAuthState(st: AuthenticationState): void {
    writeFileSync(authPath, JSON.stringify(st, BufferJSON.replacer, 2));
  }

  /**
   * @param {CommandInfo} data - Command data
   * @return {CommandInfo}
   */
  static makeCommandConfig(data: CommandInfo): CommandInfo {
    return data;
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
}
