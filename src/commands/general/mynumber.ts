import {CommandFunc} from '../../types';
import {Context} from '../../extends/context';
import {Util} from '../../objects';

const myNumberCommand: CommandFunc = async (
    ctx: Context,
) => {
  await ctx.reply(`Your whatsapp number is: *${ctx.authorNumber}*`);
};

export default Util.makeCommandConfig({
  'name': 'mynumber',
  'desc': 'Show your phone number',
  'alias': [
    'my-phone',
    'phone',
    'myphonenumber',
    'phonenumber',
  ],
  'target': myNumberCommand,
});
