import sharp from 'sharp';
import type { CommandFunc } from '../../types';
import { Util } from '../../objects';
import type { Context } from '../../extends/context';
import type { Image } from '../../extends/messages';

const negativePhoto: CommandFunc = async (ctx: Context) => {
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
		const converted = await sharp(mediaDecrypted).negate(true).toBuffer();

		await ctx.replyWithPhoto(converted);
	} catch {
		await ctx.reply('Something was wrong, try again please.');
	}
};

export default Util.makeCommandConfig({
	'name': 'negative-photo',
	'desc': 'Make your image to negative photo',
	'alias': ['blackphoto', 'negativephoto', 'negaphoto'],
	'target': negativePhoto,
});
