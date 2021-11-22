import {CommandFunc} from '../../types';
import {Context} from '../../extends/context';
import {Util} from '../../objects';

const HelpCommand: CommandFunc = async (
    ctx: Context,
) => {
  await ctx.reply('Im dumb');
};

export default Util.makeCommandConfig({
  'name': 'help',
  'desc': 'Show you an information about me',
  'alias': ['menu', 'h', 'halp'],
  'target': HelpCommand,
});
