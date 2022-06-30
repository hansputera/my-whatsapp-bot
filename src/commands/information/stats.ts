import { CommandFunc } from '../../types';
import { Context } from '../../extends/context';
import { Util } from '../../objects';
import { cpus, arch, uptime } from 'os';

const statsCommand: CommandFunc = async (ctx: Context) => {
	const startedBot = new Date(ctx.client.startTime).toLocaleDateString('id', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		minute: 'numeric',
		hour: 'numeric',
		second: 'numeric',
	});
	await ctx.reply(
		`+ Bot Statistics\n- Bot started at: ${startedBot}\n- Bot active: Active for ${Util.parseDuration(
			Date.now() - ctx.client.startTime,
			{
				colonNotation: false,
				compact: false,
			},
		)}\n\n+ System statistics\n- Memory Usage: ${(
			process.memoryUsage().heapUsed /
			1024 /
			1024
		).toFixed(2)} MiB\n- Memory RSS Usage: ${(
			process.memoryUsage().rss /
			1024 /
			1024
		).toFixed(2)} MiB` +
			`\n- Uptime: ${Util.parseDuration(uptime() * 1000, {
				compact: false,
				colonNotation: false,
			})}\n- CPU: ${arch()} ${cpus()[0].model} ${cpus().length} core(s)`,
	);
};

export default Util.makeCommandConfig({
	'name': 'stats',
	'desc': 'Show a statistic(s) about me and the system',
	'alias': ['st', 'statistic'],
	'target': statsCommand,
});
