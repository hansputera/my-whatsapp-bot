import got from 'got';
import {
  AuthenticationState, BufferJSON,
  initInMemoryKeyStore,
} from '@slonbook/baileys-md';
import {resolve as resolvePath} from 'node:path';
import {readFileSync, writeFileSync} from 'fs';
import {CommandInfo} from '../types';

const authPath = resolvePath(__dirname, '..', '..', 'auth.json');
/**
 * @class Util
 */
export class Util {
  /**
     * Use this method if you want post a text to the hastebin site.
     * @param {string} text - A text want to post.
     * @return {string}
     */
  static async postToHastebin(text: string) {
    const response = await got.post('https://www.toptal.com/developers/hastebin/documents', {
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
}
