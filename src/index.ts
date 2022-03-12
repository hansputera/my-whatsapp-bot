import 'dotenv/config';

import {resolve as resolvePath} from 'node:path';
import {unlinkSync, existsSync} from 'node:fs';
import type {Boom} from '@hapi/boom';

import * as qr from 'qrcode';
import {
  useSingleFileAuthState,
  DisconnectReason,
  BaileysEventMap,
  AuthenticationCreds,
} from '@adiwajshing/baileys';
import {Client} from './objects';

/**
 * Init baileys connection
 *
 * @return {void}
 */
function initSock(): void {
  const {state, saveState} = useSingleFileAuthState(
      resolvePath(__dirname, '..', 'auth.json'),
  );

  const client = new Client({
    'auth': state,
  });

  client.baileys.ev.on('connection.update', (conn) => {
    if (conn.qr) {
      client.logger.info('QR Generated');
      qr.toFile(resolvePath(__dirname, '..', 'qr.png'), conn.qr);
    } else if (conn.connection && conn.connection === 'close') {
      if ((conn.lastDisconnect?.error as Boom).output.statusCode !==
            DisconnectReason.loggedOut) {
        client.logger.info('Trying to reconnect');
        client.modules.free();
        for (const listener of client.modules.listens) {
          client.baileys.ev.removeAllListeners(
            listener as keyof BaileysEventMap<AuthenticationCreds>);
        }
        initSock();
      }
      if (existsSync(resolvePath(__dirname, '..', 'qr.png'))) {
        unlinkSync(resolvePath(__dirname, '..', 'qr.png'));
      }
    } else if (conn.connection && conn.connection === 'open') {
      client.logger.info('WebSocket opened');
    }
  });

  client.baileys.ev.on('creds.update', saveState);

  // start the module
  client.modules.loads();
  client.modules.loadEvents();
}


process.setMaxListeners(20);
initSock();
