import {CommandFunc} from '../../types';
import {Context} from '../../extends/context';
import {Util} from '../../objects';
import {redis} from '../../db/redis';

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

const sendTikTokFunc = async (
    ctx: Context,
    data: TikTokResponse,
) => {
  const response = await Util.fetch(
      data.video?.urls[0] as string, {
        followRedirect: true,
      },
  );
  const text = `*${data.video?.title ?? 'No title.'}* - *${data.video?.duration ?? '-'}*${
    data.caption ? '\n\n' + data.caption : ''
  }`;

  await ctx.replyWithVideo(response.rawBody, text);
};

const tiktokDownloaderCommand: CommandFunc = async (
    ctx: Context,
) => {
  const url = ctx.args.shift();
  if (!url) {
    await ctx.reply('TikTok Video URL doesn\'t valid!');
    return;
  } else {
    const videoDataCache = await redis.get(url as string);
    if (videoDataCache) {
      await sendTikTokFunc(ctx, JSON.parse(videoDataCache));
      return;
    } else {
      try {
        const response = await Util.fetch(
            'https://tiktok-dl.tslab.site/api/download', {
              'searchParams': {
                'url': url,
                'nocache': 'true',
                'type': 'snaptik',
              },
            });

        const json = JSON.parse(response.body);
        if (json.error) {
          await ctx.reply(
              'Can you try again please? ' +
                'Maybe the url is not valid or another issue',
          );
          return;
        } else {
          if (json.provider === 'tikmate' || json.provider === 'dltik') {
            await tiktokDownloaderCommand(new Context(ctx.client, ctx.msg));
            return;
          }
          await redis.set(url, response.body);
          await sendTikTokFunc(ctx, json);
          return;
        }
      } catch (e) {
        console.log((e as any).response.body);
        if (/expected/gi.test((e as any).response.body)) {
          await ctx.reply('Maybe your url isn\'t valid, try again please!');
          return;
        }
        await ctx.reply('Sorry, something was wrong. Try again!');
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
