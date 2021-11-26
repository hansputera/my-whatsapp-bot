import 'dotenv/config';

import {resolve as resolvePath} from 'node:path';
import {unlinkSync, existsSync} from 'node:fs';
import type {Boom} from '@hapi/boom';

import {Client} from './objects';
import * as qr from 'qrcode';
import {EventHandler} from './events';
import {
  useSingleFileAuthState,
  DisconnectReason,
} from '@slonbook/baileys-md';

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

  const eventsHandler = new EventHandler(client);

  client.baileys.ev.on('connection.update', (conn) => {
    if (conn.isNewLogin) {
      client.logger.info('New Login detected');
    }
    if (conn.qr) {
      client.logger.info('QR Generated');
      qr.toFile(resolvePath(__dirname, '..', 'qr.png'), conn.qr);
    } else if (conn.connection && conn.connection === 'close') {
      if ((conn.lastDisconnect?.error as Boom).output.statusCode !==
            DisconnectReason.loggedOut) {
        client.logger.info('Trying to reconnect');
        client.logger.warn('Clearing modules');
        client.modules.free();
        client.logger.warn('Modules cleared, reconnecting...');
        initSock();
      }
      if (existsSync(resolvePath(__dirname, '..', 'qr.png'))) {
        unlinkSync(resolvePath(__dirname, '..', 'qr.png'));
      }
    } else if (conn.connection && conn.connection === 'open') {
      client.logger.info('WebSocket opened');
    }
  });

  client.baileys.ev.on('creds.update', () => {
    client.logger.info('Authentication credentials has updated');

    saveState();
  });

  /** Main events */

  client.baileys.ev.on('messages.upsert',
      eventsHandler.messageUpsert.bind(eventsHandler));

  // start the module
  client.modules.loads();
}

initSock();
