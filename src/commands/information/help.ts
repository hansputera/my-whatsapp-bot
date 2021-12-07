import {CommandFunc} from '../../types';
import {Context} from '../../extends/context';
import {Util} from '../../objects';

const HelpCommand: CommandFunc = async (
    ctx: Context,
) => {
  const command = ctx.args.shift();
  if (!command) {
    await ctx.reply('There are *' + ctx.client.modules.commands.size +
            ' commands* is available!\n\n' +
                [...ctx.client.modules.mods.values()].map(
                    (m) => '*- ' + m.name + '*\n' +
                        m.commands?.map(
                            (c) => c.name,
                        ).join(', ')).join('\n'));
  } else {
    const cmd = ctx.client.modules
        .commands.get(command) || [...ctx.client.modules
        .commands.values()].find((c) => c.alias?.includes(
        command.toLowerCase(),
    ));
    if (!cmd) {
      const probabilityCmds = [
        ...ctx.client.modules.commands.values()].filter(
          (c) => c.name.startsWith(command.toLowerCase()) ||
            c.alias?.find((a) => a.startsWith(
                command.toLowerCase(),
            ))).map((c) => c.name);
      if (probabilityCmds.length) {
        await ctx.reply('Did you mean? ' + probabilityCmds.join(', '));
      } else {
        await ctx.reply(
            'I couldn\'t find a command what ' +
                'you want, could you be specific again?');
      }
    } else {
      await ctx.reply(`==== *${cmd.name.toUpperCase()} Command* ====\n\n- ${cmd.desc}\n\nYou need to wait _${(cmd.cooldown as number / 1000).toFixed(2)} second(s)_ to use this command after you had execute another command.\nAlso, you can use: ${cmd.alias?.join(',')} to execute this command.`);
    }
  }
};

export default Util.makeCommandConfig({
  'name': 'help',
  'desc': 'Show you an information about me',
  'alias': ['menu', 'h', 'halp'],
  'target': HelpCommand,
});
