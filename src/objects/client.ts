import baileys, {SocketConfig} from '@slonbook/baileys-md';
import {createLogger} from './logger';

/**
 * @class Client
 */
export class Client {
  /**
     * Client constructor.
     * @param {Partial<SocketConfig>} _options - Baileys socket configuration.
     */
  constructor(private _options?: Partial<SocketConfig>) {}

  public logger = createLogger('client');
  public baileys = baileys({
    ...this._options,
    logger: this.logger,
  });
}
