import {Brainly, Question, Answer} from 'brainly-scraper-v2';
import type {CommandFunc} from '../../types';
import type {Context} from '../../extends/context';
import {Util} from '../../objects';
import {redis} from '../../db/redis';

const brainlyCommand: CommandFunc = async (
    ctx: Context,
) => {
  try {
    const question = ctx.args.join(' ');
    if (!question.length) {
      await ctx.reply('Please provide a question');
      return;
    }

    const brainly = new Brainly();

    const redisResult = await redis.get(
        'br-' + encodeURIComponent(
            question.toLowerCase(),
        ),
    );

    let qs = redisResult ? JSON.parse(redisResult) as {
            question: Question;
            answers: Answer[];
        }[] :
                await brainly.searchWithMT('id', question);

    await redis.set('br-' +
            encodeURIComponent(question.toLowerCase()), JSON.stringify(qs));
    if (!qs.length) {
      await ctx.reply('I couldn\'t find the answer(s)');
      return;
    }

    qs = qs.filter((q) => q.answers.length);

    const LCtx = await ctx.reply('Please type number bellow [1-' +
            qs.length + ']\n\n' +
                qs.map((q, i) => i+1 + '. ' + q.question.content).join('\n'));
    const collector = ctx.getCollector({
      'max': 1,
      'time': 30 * 1000,
      'validation': (vctx) => vctx.authorNumber === ctx.authorNumber &&
                vctx.currentJid() === ctx.currentJid() && parseInt(
          vctx.text,
      ) != NaN,
    });
    collector.start();

    await collector.wait();

    if (!collector.contexts.length && ctx.isGroup && !ctx.getGroup()) {
        return;
    }

    await LCtx.delete();
    if (!collector.contexts.length) {
      await ctx.reply('Time is up, try again!');
      return;
    }

    const index = parseInt(collector.contexts[0].text);
    if (index === -1) {
      await ctx.reply('invalid number, try again pls');
      return;
    }
    const qSelected = qs.at(index - 1);

    if (!qSelected) {
      await ctx.reply('invalid number, try again pls');
      return;
    }

    const qMsg = await ctx.reply(`Question: ${qSelected.question.content}\n\nBy: ${qSelected.question.author ? qSelected.question.author.username || qSelected.question.author.id : 'unknown.'}\nPoint (Q/A): ${qSelected.question.points_question}/${qSelected.question.points_answer.normal}`);
    qSelected.answers.forEach(async (answer) => {
      const img = answer.attachments[0];
      const t = `${answer.content}\n\nBy: ${answer.author ? answer.author.username || answer.author.id : 'unknown.'}\nThanks/Rate Count: ${answer.thanksCount}/${answer.ratesCount}\nIs best answer? ${answer.isBest ? 'Yes' : 'Nope.'}`;
      if (img) {
        await qMsg.replyWithPhoto(img, t);
      } else await qMsg.reply(t);
    });
  } catch (e) {
    await ctx.reply('Something was wrong, try again p'+
        'ls.\nError: ' + (e as Error).message);
  }
};

export default Util.makeCommandConfig({
  'name': 'brainly',
  'desc': 'Search any question on Brainly',
  'cooldown': 10000,
  'target': brainlyCommand,
  'alias': [
    'br',
    'brenli',
    'brain',
  ],
});
