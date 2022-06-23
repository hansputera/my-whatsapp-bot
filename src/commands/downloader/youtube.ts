import { CommandFunc } from '../../types';
import { Context } from '../../extends/context';
import { Util } from '../../objects';

import ytdl from 'ytdl-core';
import ytsr from 'ytsr';
import { Blob } from 'buffer';
import { redis } from '../../db/redis';

export const YouTubeDownloader: CommandFunc = async (ctx: Context) => {
	const u = (await redis.get('yt-session-' + ctx.authorNumber)) || 0;
	if (u && parseInt(u) >= 3) {
		await ctx.reply(
			'You already have 3 session to use this command! Try again later!',
		);
		return;
	}
	if (!ctx.args.length) {
		await ctx.reply('Please provide url/query!');
		return;
	}

	const mediaFlag = ctx.flags.find((f) =>
		['mp3', 'mp4', 'video', 'audio'].includes(f.toLowerCase()),
	);
	const key = ctx.args.join(' ');
	const info = {
		'url': '',
		'text': '',
		'name': '',
	};

	if (ytdl.validateURL(key)) {
		const infoYtdl = await ytdl.getBasicInfo(key);
		if (infoYtdl.videoDetails.isLiveContent) {
			await ctx.reply("This video is live stream, i can't download it!");
			return;
		} else if (parseInt(infoYtdl.videoDetails.lengthSeconds) >= 20 * 60) {
			await ctx.reply(
				"The video duration is too long, i can't download it!",
			);
			return;
		}
		info.name = infoYtdl.videoDetails.title;
		info.url = infoYtdl.videoDetails.video_url;
		info.text = `Downloading *${
			infoYtdl.videoDetails.title
		}* with duration *${
			infoYtdl.videoDetails.lengthSeconds
		} seconds*\nChannel: *${infoYtdl.videoDetails.author.name}*\nURL: *${
			infoYtdl.videoDetails.video_url
		}*\nDescription:\n\n${infoYtdl.videoDetails.description ?? '-'}`;
	} else {
		const searchResults = (await ytsr(key, {})).items.filter(
			(v) => v.type === 'video',
		) as ytsr.Video[];

		const contextSelect = await ctx.reply(
			'Please reply this message' +
				' with which one number bellow:\n\n' +
				searchResults.map((s, i) => `${i + 1}. ${s.title}`).join('\n'),
		);
		const collector = ctx.getCollector({
			max: 1,
			validation: (ctxC) =>
				ctxC.currentJid() === ctx.currentJid() &&
				ctxC.authorNumber === ctx.authorNumber,
		});

		collector.start();
		await collector.wait();

		if (!collector.contexts.length && ctx.isGroup && !ctx.getGroup()) {
			return;
		}

		await contextSelect?.delete();
		const num = collector.contexts[0].text;
		if (isNaN(num as unknown as number)) {
			await ctx.reply('Invalid option!');
			return;
		} else {
			if (!searchResults.at(parseInt(num) - 1)) {
				await ctx.reply(
					'Invalid option, gi' +
						've me a number that like "1" or "2"',
				);
				return;
			}
		}

		const durs = searchResults[parseInt(num) - 1].duration?.split(
			':',
		) as string[];
		if (searchResults[parseInt(num)].isLive) {
			await ctx.reply("This video is live stream, i can't download!");
			return;
		} else if (durs.length > 2) {
			await ctx.reply(
				'This video duration is too long, oh god *' +
					durs[0] +
					' hours* :<',
			);
			return;
		} else if (durs.length == 2 && parseInt(durs[parseInt(num) - 1]) > 20) {
			await ctx.reply(
				"This video duration is too long, i can't download it!",
			);
			return;
		}

		info.name = searchResults[parseInt(num) - 1].title;
		info.url = searchResults[parseInt(num) - 1].url;
		info.text = `Downloading *${
			searchResults[parseInt(num) - 1].title
		}* with duration *${
			searchResults[parseInt(num) - 1].duration
		}*\nChannel: *${
			searchResults[parseInt(num) - 1].author?.name
		}*\nURL: *${searchResults[parseInt(num) - 1].url}*\nDescription:\n\n${
			searchResults[parseInt(num) - 1].description ?? '-'
		}`;
	}

	await ctx.reply(info.text);
	let buffs = Buffer.alloc(0);
	const stream = ytdl(info.url, {
		'filter': mediaFlag
			? mediaFlag === 'mp4'
				? 'audioandvideo'
				: 'audioonly'
			: 'audioonly',
		'quality': 'highest',
	});

	await redis.incr('yt-session-' + ctx.authorNumber);

	stream.on('data', (ch) => {
		ctx.client.logger.info(
			new Blob([buffs]).size + ' bytes downloaded at: ' + info.url,
		);
		if (new Blob([buffs]).size >= 215000000) {
			stream.destroy();
			ctx.reply('Downloaded has been stopped due storage limit!');
		} else {
			buffs = Buffer.concat([buffs, Buffer.from(ch)]);
		}
	});

	stream.on('end', async () => {
		const countSession = parseInt(
			(await redis.get('yt-session-' + ctx.authorNumber)) as string,
		);
		await redis.set(
			'yt-session-' + ctx.authorNumber,
			countSession > 0 ? countSession - 1 : 0,
		);
		await ctx.reply('Download completed, sending...');
		if (!mediaFlag || mediaFlag === 'mp3' || mediaFlag === 'audio') {
			await ctx.replyWithAudio(buffs);
		} else if (
			(mediaFlag && mediaFlag === 'mp4') ||
			mediaFlag === 'video'
		) {
			await ctx.replyWithVideo(buffs, `Downloaded *${info.name}*`);
		}
	});

	stream.on('error', (err) => {
		if (err.message === 'leaved') {
			ctx.client.logger.warn(
				'YouTube Download for: ' +
					ctx.currentJid() +
					'stopped because getting kicked from the group!',
			);
		}
	});
};

export default Util.makeCommandConfig({
	'name': 'youtube',
	'desc': 'Download YouTube video',
	'alias': ['yt', 'ytdl', 'downloadyt'],
	'target': YouTubeDownloader,
	'cooldown': 30_000,
});
