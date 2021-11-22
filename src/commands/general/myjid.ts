import {CommandFunc} from '../../types';
import type {Context} from '../../extends/context';
import {Util} from '../../objects';

const MyJidCommand: CommandFunc = async (
    ctx: Context,
) => {
  await ctx.reply(
      `Current WhatsApp JID is: *${ctx.msg.key.remoteJid ?? 'unknown'}*`);
};

export default Util.makeCommandConfig({
  'name': 'myjid',
  'desc': 'Show your JID',
  'alias': ['jid', 'me-jid'],
  'cooldown': 10000,
  'target': MyJidCommand,
});
