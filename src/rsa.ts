import {
	createPrivateKey,
	createPublicKey,
	KeyObject,
	privateDecrypt,
	publicEncrypt,
} from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { inflateSync, constants as ZlibConstants } from 'node:zlib';

/**
 * @class RSA
 */
export class RSA {
	private privateKey!: KeyObject;
	public publicKey!: KeyObject;
	public secretKey!: Buffer;

	/**
	 * @constructor
	 */
	constructor() {
		if (existsSync(resolve(__dirname, '..', 'keys')) && process.env.KEY) {
			let privateKeyContent =
				process.env.PRIVATE_KEY ||
				readFileSync(
					resolve(__dirname, '..', 'keys', 'private.key.pem'),
					{
						'encoding': 'utf8',
					},
				);
			this.secretKey = Buffer.from(process.env.KEY, 'hex');
			if (process.env.PRIVATE_KEY) {
				privateKeyContent = inflateSync(
					Buffer.from(privateKeyContent, 'hex'),
					{
						'level': ZlibConstants.Z_BEST_COMPRESSION,
						'memLevel': ZlibConstants.Z_RLE,
					},
				).toString('hex');
				privateKeyContent = inflateSync(
					Buffer.from(privateKeyContent, 'hex'),
					{
						'level': ZlibConstants.Z_BEST_COMPRESSION,
						'memLevel': ZlibConstants.Z_RLE,
					},
				).toString('utf8');
			}
			const publicKeyContent = readFileSync(
				resolve(__dirname, '..', 'keys', 'public.key.pem'),
				{
					'encoding': 'utf8',
				},
			);

			this.privateKey = createPrivateKey({
				key: privateKeyContent,
				format: 'pem',
				type: 'pkcs1',
				passphrase: process.env.KEY,
			});
			this.publicKey = createPublicKey({
				format: 'pem',
				type: 'pkcs1',
				key: publicKeyContent,
			});
		}
	}

	/**
	 * Decrypt encrypted content.
	 * @param {Buffer} content Encrypted content.
	 * @return {Promise<Buffer>} Decrypted contents.
	 */
	async decrypt(content: Buffer): Promise<Buffer | undefined> {
		try {
			return privateDecrypt(this.privateKey, content);
		} catch {
			return undefined;
		}
	}

	/**
	 * Encrypt raw content.
	 * @param {Buffer} content Raw content.
	 * @return {Promise<Buffer>} Encrypted contents.
	 */
	async encrypt(content: Buffer): Promise<Buffer | undefined> {
		try {
			return publicEncrypt(this.publicKey, content);
		} catch {
			return undefined;
		}
	}
}

export const rsa = new RSA();
