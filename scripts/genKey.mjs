import { generateKeyPairSync, randomBytes, scryptSync } from 'node:crypto';
import dotenv from 'dotenv';
import * as readline from 'node:readline/promises';
import { cwd, stdin, stdout } from 'node:process';
import { resolve } from 'node:path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { constants, deflateSync } from 'node:zlib';

dotenv.config();

/**
 * Ask a question.
 * @param {readline.Interface} rl Readline interface.
 * @param {string} question A question want to ask.
 * @param {Function} validateFunc A validator to validate the answer.
 * @return {Promise<string>}
 */
async function ask(rl, question, validateFunc = async () => true) {
	let isValid = false;
	let answer = '';

	while (!isValid) {
		answer = await rl.question(question);
		const validate = await validateFunc(answer).catch((e) => ({
			'error': e.message,
		}));

		isValid = !!!validate.error;

		if (!isValid) {
			answer = '';
			console.log(validate.error || 'Unexpected answer, try again!\n\n');
		}
	}

	return answer;
}

/**
 * Generate key.
 * @return {Promise<void>}
 */
async function generateKey() {
	if (!existsSync(resolve(cwd(), 'keys'))) mkdirSync(resolve(cwd(), 'keys'));

	console.log('Welcome to Key Generator Script');
	console.log('Date time:', new Date());

	const readlineInterface = readline.createInterface({
		input: stdin,
		output: stdout,
	});

	const secretKey = await ask(
		readlineInterface,
		'Give me your secret key: ',
		async (value) => {
			if (value.length < 5) {
				throw new Error('Secret key must be higher than 5 chars!');
			} else {
				return Promise.resolve({});
			}
		},
	);

	const hashSecretKey = scryptSync(secretKey, randomBytes(16), 32);

	console.log('\nGenerating key..');
	const keyPair = generateKeyPairSync('rsa', {
		modulusLength: 4096,
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
			passphrase: hashSecretKey.toString('hex'),
			cipher: 'aes-256-cbc',
		},
		publicKeyEncoding: {
			type: 'pkcs1',
			format: 'pem',
		},
	});

	console.log("Writing public key, and the private key to 'keys' folder");
	writeFileSync(
		resolve(cwd(), 'keys', 'private.key.pem'),
		keyPair.privateKey,
	);
	writeFileSync(resolve(cwd(), 'keys', 'public.key.pem'), keyPair.publicKey);

	let compressedPrivateKey = deflateSync(keyPair.privateKey, {
		level: constants.Z_BEST_COMPRESSION,
		memLevel: constants.Z_RLE,
	});

	compressedPrivateKey = deflateSync(compressedPrivateKey, {
		level: constants.Z_BEST_COMPRESSION,
		memLevel: constants.Z_RLE,
	});

	const contentsOnEnv = readFileSync(resolve(cwd(), '.env'), {
		encoding: 'utf8',
	});
	const contentsParsed = dotenv.parse(
		contentsOnEnv.concat(
			'\n',
			'PRIVATE_KEY=',
			compressedPrivateKey.toString('hex'),
			'\n',
			'KEY=',
			hashSecretKey.toString('hex'),
		),
	);

	writeFileSync(
		resolve(cwd(), '.env'),
		Object.keys(contentsParsed)
			.map((x) => `${x}=${contentsParsed[x]}`)
			.join('\n'),
	);

	console.log('Done! See you next time!');
	readlineInterface.close();
}

if (existsSync(resolve(cwd(), 'keys', 'public.key.pem'))) {
	console.log('Public key exists, delete it first!');
	process.exit(1);
} else if (existsSync(resolve(cwd(), 'keys', 'private.key.pem'))) {
	console.log('Private key exists, delete it first!');
	process.exit(1);
}

generateKey();
