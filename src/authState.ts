import {
	AuthenticationCreds,
	AuthenticationState,
	BufferJSON,
	initAuthCreds,
	proto,
	SignalDataTypeMap,
} from '@adiwajshing/baileys';
import { createCipheriv, createDecipheriv } from 'node:crypto';
import { existsSync, statSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { constants as zlibConst, deflateSync, inflateSync } from 'node:zlib';

export interface AuthStateType {
	state?: AuthenticationState;
	saveState: () => Promise<void>;
}

// eslint-disable-next-line max-len
// src: https://github.com/adiwajshing/Baileys/blob/master/src/Utils/use-single-file-auth-state.ts

export const KEY_MAP: Record<keyof SignalDataTypeMap, string> = {
	'pre-key': 'preKeys',
	'session': 'sessions',
	'sender-key': 'senderKeys',
	'app-state-sync-key': 'appStateSyncKeys',
	'app-state-sync-version': 'appStateVersions',
	'sender-key-memory': 'senderKeyMemory',
};

// Implementing https://github.com/hansputera-lab/encfiles-practice.git
const toState = (
	authFile: string,
	creds: AuthenticationCreds = initAuthCreds(),
	keys: any = {},
): AuthStateType => {
	if (!creds) creds = initAuthCreds();
	else if (!keys) keys = {};

	const saveState = async (): Promise<void> => {
		return await new Promise(async (resolve, reject) => {
			try {
				let payloadBuff = deflateSync(
					JSON.stringify({ creds, keys }, BufferJSON.replacer),
					{
						memLevel: zlibConst.Z_RLE,
						level: zlibConst.Z_BEST_COMPRESSION,
					},
				);

				const cipher = createCipheriv(
					'aes-256-cbc',
					Buffer.from(process.env.KEY!, 'hex'),
					Buffer.from(process.env.AES_IV!, 'hex'),
				);

				payloadBuff = Buffer.concat([
					cipher.update(payloadBuff),
					cipher.final(),
				]);

				await writeFile(authFile, payloadBuff);
				return resolve();
			} catch (e) {
				return reject(e);
			}
		});
	};

	return {
		'state': {
			creds,
			keys: {
				get: async (type, ids) => {
					const key = KEY_MAP[type];
					return ids.reduce((dict: Record<string, string>, id) => {
						let value = keys[key]?.[id];
						if (value) {
							if (type === 'app-state-sync-key') {
								value =
									proto.AppStateSyncKeyData.fromObject(value);
							}

							dict[id] = value;
						}

						return dict;
					}, {});
				},
				set: (data) => {
					for (const kunci in data) {
						// eslint for-guard-in pass
						if (Object.prototype.hasOwnProperty.call(data, kunci)) {
							const key =
								KEY_MAP[kunci as keyof SignalDataTypeMap];
							keys[key] = keys[key] || {};
							Object.assign(
								keys[key],
								data[kunci as keyof typeof data],
							);
						}
					}

					saveState();
				},
			},
		},
		saveState,
	};
};

export const useAuthStateFile = async (
	authFile: string,
): Promise<AuthStateType> => {
	if (!existsSync(authFile)) {
		await writeFile(authFile, '');
		return toState(authFile);
	} else {
		return await new Promise(async (resolve, reject) => {
			if (statSync(authFile).size <= 5) {
				return resolve(toState(authFile));
			}

			const decipher = createDecipheriv(
				'aes-256-cbc',
				Buffer.from(process.env.KEY!, 'hex'),
				Buffer.from(process.env.AES_IV!, 'hex'),
			);

			let contents = await readFile(authFile);
			contents = Buffer.concat([
				decipher.update(contents),
				decipher.final(),
			]);
			contents = inflateSync(contents, {
				memLevel: zlibConst.Z_RLE,
				level: zlibConst.Z_BEST_COMPRESSION,
			});

			try {
				const parsed = JSON.parse(
					contents.toString(),
					BufferJSON.reviver,
				);
				return resolve(toState(authFile, parsed.creds, parsed.keys));
			} catch {
				return reject(new Error('Invalid JSON!'));
			}
		});
	}
};
