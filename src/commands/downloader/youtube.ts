import {CommandFunc} from '../../types';
import {Context} from '../../extends/context';
import {Util} from '../../objects';

export const YouTubeDownloader: CommandFunc = async (
    ctx: Context,
) => {
  console.log(ctx.args);
};

export default Util.makeCommandConfig({
  'name': 'youtube',
  'desc': 'Download YouTube video',
  'alias': ['yt', 'ytdl', 'downloadyt'],
  'target': YouTubeDownloader,
});
