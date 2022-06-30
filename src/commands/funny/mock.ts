import got from 'got';
import { CommandFunc } from '../../types';
import { Context } from '../../extends/context';
import { Util } from '../../objects';

const mockCommand: CommandFunc = async (ctx: Context) => {
	try {
		if (!process.env.imgflip_username || !process.env.imgflip_password) {
			await ctx.reply('Please set imgflip_username and imgflip_password');
			return;
		}
		if (!ctx.args[0]) {
			await ctx.reply('Please specify a text!');
			return;
		}
		const text = ctx.args.join(' ').split('#')[0];
		const text1 = ctx.args.join(' ').split('#')[1] ?? '';

		const loadingText = await ctx.reply('Loading...');
		const anImage = await got.get('https://api.imgflip.com/caption_image', {
			'searchParams': {
				'username': process.env.imgflip_username,
				'password': process.env.imgflip_password,
				'template_id': '102156234',
				'text0': text,
				'text1': text1,
			},
		});

		await loadingText?.delete();

		const json = JSON.parse(anImage.body);
		if (!json.success) {
			await ctx.reply('Something went wrong!');
			return;
		}

		await ctx.replyWithPhoto(
			json.data.url,
			Util.mockText(text + ' ' + text1),
		);
	} catch (e) {
		await ctx.reply('Something went wrong!\nError:' + e);
		return;
	}
};

export default Util.makeCommandConfig({
	'name': 'mock',
	'desc': 'SpOnGeBoB mOcK',
	'alias': ['mocking', 'mocks'],
	'target': mockCommand,
});
