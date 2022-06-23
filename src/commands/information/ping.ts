import { Context } from '../../extends/context';
import { CommandFunc } from '../../types';
import { Util } from '../../objects';

const PingCommand: CommandFunc = async (ctx: Context) => {
	await ctx.reply('yoo masuk');
};

export default Util.makeCommandConfig({
	'name': 'ping',
	'desc': 'Ping Pong',
	'alias': ['pong'],
	'target': PingCommand,
});
