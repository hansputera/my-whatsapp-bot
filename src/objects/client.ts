import * as path from 'node:path';
import baileys, {SocketConfig} from '@slonbook/baileys-md';
import {createLogger} from './logger';
import {Modules} from './module';
import {MessageCollector} from '../extends/collector';

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
  public modules = new Modules(path.resolve(
      __dirname, '..', 'commands',
  ));
  public startTime = Date.now();
  public collectors: Map<string, MessageCollector> = new Map();
}
