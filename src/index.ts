import 'dotenv/config';

import { resolve as resolvePath } from 'node:path';
import { unlinkSync, existsSync } from 'node:fs';
import type { Boom } from '@hapi/boom';

import * as qr from 'qrcode';
import { DisconnectReason, AuthenticationState } from '@adiwajshing/baileys';
import { Client } from './objects';
import { useAuthStateFile } from './authState';

/**
 * Init baileys connection
 *
 * @param {Client} client - Client instance
 * @return {Promise<void>}
 */
async function initSock(client?: Client): Promise<void> {
	try {
		const { state, saveState } = await useAuthStateFile(
			resolvePath(__dirname, '..', 'auth.json.enc'),
		);

		if (!client)
			client = new Client({
				'auth': state as AuthenticationState,
			});

		client.baileys.ev.on('connection.update', (conn) => {
			if (conn.qr) {
				client!.logger.info('QR Generated');
				qr.toFile(resolvePath(__dirname, '..', 'qr.png'), conn.qr);
			} else if (conn.connection && conn.connection === 'close') {
				if (
					(conn.lastDisconnect?.error as Boom).output.statusCode !==
					DisconnectReason.loggedOut
				) {
					client!.logger.info('Trying to reconnect');
					for (const listener of client!.modules.listens) {
						client!.baileys.ev.removeAllListeners(listener);
					}
					client!.modules.free();

					client = new Client({
						'auth': state as AuthenticationState,
					});
					initSock(client);
				} else if (
					(conn.lastDisconnect?.error as Boom).output.statusCode ===
					DisconnectReason.connectionReplaced
				) {
					client!.logger.info(
						'Connection replaced, another session logged-in!',
					);
					process.exit(0);
				} else {
					client!.logger.warn('Logged out, cleaning up...');
					unlinkSync(resolvePath(__dirname, '..', 'auth.json.enc'));
					process.exit(0);
				}

				if (existsSync(resolvePath(__dirname, '..', 'qr.png'))) {
					unlinkSync(resolvePath(__dirname, '..', 'qr.png'));
				}
			} else if (conn.connection && conn.connection === 'open') {
				client!.logger.info('WebSocket opened');
			}
		});

		client.baileys.ev.on('creds.update', () => {
			saveState().catch((err) => {
				client!.logger.warn(
					'Fail to save credentials, reason:',
					err.message,
				);
			});
		});

		// start the module
		client.modules.loads();
		client.modules.loadEvents();

		client.logger.info('Loaded', client.modules.listens.length, 'modules');
		client.logger.info('Loaded', client.modules.listens.length, 'events');
	} catch (err) {
		if (err instanceof Error) {
			console.error(err.message);
			process.exit(1);
		}
	}
}

process.setMaxListeners(10);
initSock();
