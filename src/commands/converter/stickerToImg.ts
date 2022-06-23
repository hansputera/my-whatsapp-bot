import sharp from 'sharp';
import { CommandFunc } from '../../types';
import { Context } from '../../extends/context';
import { Util } from '../../objects';

const stickerToImg: CommandFunc = async (ctx: Context) => {
	const replied = ctx.getReply();
	if (!replied) {
		await ctx.reply('Please reply a message contains sticker!');
		return;
	} else {
		const sticker = replied.sticker;
		if (!sticker) {
			await ctx.reply(
				'You have reply wrong message, ' +
					'please reply a message contains sticker!',
			);
			return;
		} else {
			const isGIF = !!ctx.flags.find((f) => f.toLowerCase() === 'gif');

			if (isGIF && !sticker.animated) {
				await ctx.reply(
					'Are you trying to convert an image to ' + 'a GIF?',
				);
				return;
			}
			try {
				const stickerBuffer = await sticker.retrieveFile();

				await ctx.reply('Converting ...');
				const sharped = sharp(stickerBuffer);

				if (isGIF) {
					await ctx.replyWithVideo(await sharped.gif().toBuffer());
				} else {
					await ctx.replyWithPhoto(await sharped.png().toBuffer());
				}
			} catch (e) {
				await ctx.reply(
					'Something was wrong, try again please?\n' +
						'Error: ' +
						(e as Error).message,
				);
			}
		}
	}
};

export default Util.makeCommandConfig({
	'name': 'stickertoimg',
	'desc': 'Convert sticker to image',
	'alias': [
		'stoimg',
		'toimg',
		'sticker-to-img',
		'stickertoimage',
		'stoimage',
	],
	'target': stickerToImg,
});
