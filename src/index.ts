import 'dotenv/config';

import {resolve as resolvePath} from 'node:path';
import {unlinkSync, existsSync} from 'node:fs';
import type {Boom} from '@hapi/boom';

import * as qr from 'qrcode';
import {EventHandler} from './events';
import {
  useSingleFileAuthState,
  DisconnectReason,
} from '@slonbook/baileys-md';
import {AdapterClient} from './objects/adapter.client';

/**
 * Init baileys connection
 *
 * @return {void}
 */
function initSock(): void {
  const {state, saveState} = useSingleFileAuthState(
      resolvePath(__dirname, '..', 'auth.json'),
  );

  const client = new AdapterClient({
    'auth': state,
  });

  const eventsHandler = new EventHandler(client);

  client.baileys.ev.on('connection.update', (conn) => {
    if (conn.qr) {
      client.logger.info('QR Generated');
      qr.toFile(resolvePath(__dirname, '..', 'qr.png'), conn.qr);
    } else if (conn.connection && conn.connection === 'close') {
      if ((conn.lastDisconnect?.error as Boom).output.statusCode !==
            DisconnectReason.loggedOut) {
        client.logger.info('Trying to reconnect');
        client.modules.free();
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

  /** Main events */

  client.baileys.ev.on('messages.upsert',
      eventsHandler.messageUpsert.bind(eventsHandler));

  client.baileys.ev.on('groups.upsert',
      eventsHandler.groupUpsert.bind(eventsHandler));

  client.baileys.ev.on('groups.update',
      eventsHandler.groupUpdate.bind(eventsHandler));

  // start the module
  client.modules.loads();
}

initSock();
