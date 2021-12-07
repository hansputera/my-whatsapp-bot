import {CommandFunc} from '../../types';
import {Context} from '../../extends/context';
import {Util} from '../../objects';

const reverseTextCommand: CommandFunc = async (
    ctx: Context,
) => {
  const text = ctx.args.join(' ');
  if (!text.length) {
    await ctx.reply('Please provide a text to reverse!');
    return;
  }

  await ctx.reply(text.split('').reverse().join(''));
};

export default Util.makeCommandConfig({
  'name': 'reverse-text',
  'desc': '.siht ekil txet a esreveR',
  'alias': [
    'reverse',
    'reverseatext',
    'reverse-a-text',
  ],
  'target': reverseTextCommand,
});
