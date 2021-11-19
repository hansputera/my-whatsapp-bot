import 'dotenv/config';

import {resolve as resolvePath} from 'node:path';
import {unlinkSync, existsSync} from 'node:fs';

import {Client, Util} from './objects';
import * as qr from 'qrcode';
import {EventHandler} from './events';

const client = new Client(Util.loadAuthState() ? {
  'auth': Util.loadAuthState(),
} : {});

const eventsHandler = new EventHandler(client);

client.baileys.ev.on('connection.update', (conn) => {
  if (conn.qr) {
    client.logger.info('QR Generated');
    qr.toFile(resolvePath(__dirname, '..', 'qr.png'), conn.qr);
  } else if (conn.connection && conn.connection === 'close') {
    if (existsSync(resolvePath(__dirname, '..', 'qr.png'))) {
      unlinkSync(resolvePath(__dirname, '..', 'qr.png'));
    }
  } else if (conn.connection && conn.connection === 'open') {
    client.logger.info('WebSocket opened');
  }
});

client.baileys.ev.on('auth-state.update', () => {
  client.logger.info('Authentication credentials has updated');

  Util.saveAuthState(client.baileys.authState);
});

/** Main events */

client.baileys.ev.on('messages.upsert',
    eventsHandler.messageUpsert.bind(eventsHandler));

// start the module
client.modules.loads();
