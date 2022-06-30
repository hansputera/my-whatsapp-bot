import { CommandFunc } from '../../types';
import { Context } from '../../extends/context';
import { Util } from '../../objects';

const mockTextCommand: CommandFunc = async (ctx: Context) => {
	const text = ctx.args.join(' ');
	if (!text) {
		await ctx.reply('You need to send a text!');
		return;
	}

	await ctx.reply(Util.mockText(text));
};

export default Util.makeCommandConfig({
	'name': 'mock-text',
	'desc': 'MoCkIng A TexT lIke ThIs',
	'alias': ['mocktext', 'mocking-text', 'mockatext', 'mock-a-text'],
	'target': mockTextCommand,
});
