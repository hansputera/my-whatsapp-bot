import { CommandFunc } from '../../types';
import { Context } from '../../extends/context';
import { Util } from '../../objects';
import { redis } from '../../db/redis';

interface TikTokResponse {
	error?: string;
	video?: {
		id?: string;
		thumb?: string;
		urls: string[];
		title?: string;
		duration?: string;
	};
	music?: {
		url: string;
		title?: string;
		author?: string;
		id?: string;
		cover?: string;
		album?: string;
		duration?: number;
	};
	author?: {
		username?: string;
		thumb?: string;
		id?: string;
		nick?: string;
	};
	caption?: string;
	playsCount?: number;
	sharesCount?: number;
	commentsCount?: number;
	likesCount?: number;
	uploadedAt?: string;
	updatedAt?: string;
	provider: string;
}

const sendTikTokFunc = async (ctx: Context, data: TikTokResponse) => {
	const response = await Util.fetch(data.video?.urls[0] as string, {
		followRedirect: true,
	});
	const text = data.caption ?? '';

	await ctx.replyWithVideo(response.rawBody, text);
};

const tiktokDownloaderCommand: CommandFunc = async (ctx: Context) => {
	const url = ctx.args.shift();
	if (!url) {
		await ctx.reply('You need to specify a link!');
		return;
	} else {
		const videoDataCache = await redis.get(url as string);
		if (videoDataCache) {
			await sendTikTokFunc(ctx, JSON.parse(videoDataCache));
			return;
		} else {
			try {
				const response = await Util.fetch(
					'https://tdl.heran.xyz/api/download',
					{
						'searchParams': {
							'url': url,
							'type': 'savefrom',
						},
					},
				);

				const json = JSON.parse(response.body);
				if (json.error) {
					await ctx.reply(
						'Looks like the link is invalid or' +
							' the video is private.',
					);
					return;
				} else {
					await redis.set(url, response.body);
					await sendTikTokFunc(ctx, json);
					return;
				}
			} catch (e) {
				if (/expected/gi.test((e as any).response.body)) {
					await ctx.reply(
						'Can you please try again with a valid link?',
					);
					return;
				}
				await ctx.reply('Something went wrong!');
			}
		}
	}
};

export default Util.makeCommandConfig({
	'name': 'tiktok',
	'desc': 'Download TikTok Video Without watermark',
	'alias': ['tik-tok', 'ttdownloader', 'tiktokdl'],
	'target': tiktokDownloaderCommand,
});
