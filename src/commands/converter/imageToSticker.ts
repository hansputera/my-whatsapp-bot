import sharp from 'sharp';
import { CommandFunc } from '../../types';
import type { Context } from '../../extends/context';
import { Util } from '../../objects';
import type { Image } from '../../extends/messages';

const ImageToSticker: CommandFunc = async (ctx: Context) => {
	try {
		let image: Image;

		const reply = ctx.getReply();
		if (reply) {
			if (!reply.image) {
				await ctx.reply(
					'Make sure you have reply a message contains image.',
				);
				return;
			}

			image = reply.image;
		} else {
			if (!ctx.image) {
				await ctx.reply(
					'Please send an image using caption or reply' +
						' a message contains image.',
				);
				return;
			}

			image = ctx.image;
		}

		await ctx.reply('Converting ...');

		const mediaDecrypted = await image.retrieveFile();
		const converted = await sharp(mediaDecrypted).webp().toBuffer();

		await ctx.replyWithSticker(converted);
	} catch {
		await ctx.reply('Something was wrong, try again please.');
	}
};

export default Util.makeCommandConfig({
	'name': 'imagetosticker',
	'desc': 'Convert an image to sticker easily!',
	'alias': [
		'imgtosticker',
		'pictosticker',
		'picturetosticker',
		'image-to-sticker',
		'img-to-sticker',
	],
	'target': ImageToSticker,
});
