import { Telegraf } from 'telegraf';
import { Yad2Product } from '../interfaces/yad2-product.interface';
import { Yad2Scrapper } from '../scrappers/yad2.scrapper';
import { DBManager } from '../services/db-manager.service';

export class ProductFinderBot {
  private _bot: Telegraf;
  private _dbManager: DBManager;
  get bot(): Telegraf {
    return this._bot;
  }
  constructor(private _yad2Scrapper: Yad2Scrapper) {
    this._dbManager = new DBManager();
    this.initBot();
  }

  private initBot() {
    this._bot = new Telegraf(process.env.BOT_TOKEN);
    this.bot.start(ctx => ctx.reply('Welcome, To Find PS5 Israel'));
    this.bot.help(ctx =>
      ctx.reply(
        `Send /yad2 command to get products from yad2.
         Send /subscribe command to get notifications on new products.
         Send /unsubscribe command to unsubscribe from all notifications.`,
      ),
    );
    this.bot.command('yad2', ctx => {
      const header = `We found ${this._yad2Scrapper.lastYad2Data.length} items from YAD2 \n\n`;
      const message = this.yad2ProductsToText(header, this._yad2Scrapper.lastYad2Data);
      const msgChunks = this.chunkSubstr(message, 4096);
      msgChunks.forEach(chunk => ctx.reply(chunk));
    });
    this.bot.hears('hi', ctx => ctx.reply('Hey there, use /help command to learn how to use'));
    this.bot.hears('Hi', ctx => ctx.reply('Hey there'));
    this.bot.command('subscribe', ctx => {
      try {
        this._dbManager.addTelegramUser(
          { userId: ctx.from.id, chatId: ctx.chat.id },
          () => {
            ctx.reply(
              `Congrats! You will get notifications when new products are available.
             To cancel notifications use /unsubscribe command`,
            );
          },
          err => {
            ctx.reply('Unfortunately, we failed to subscribe you, please try again later');
          },
        );
      } catch (err) {
        console.log(err);
      }
    });

    this.bot.command('unsubscribe', ctx => {
      this._dbManager.deleteTelegramUser(
        { userId: ctx.from.id, chatId: ctx.chat.id },
        () => {
          ctx.reply('We successfully unsubscribed you from notifications.');
        },
        () => {
          ctx.reply('Something went wrong, we failed to unsubscribe you from notifications, please try again later.');
        },
      );
    });
    this.bot.launch();
  }

  private yad2ProductsToText(header: string, products: Yad2Product[]): string {
    const itemsStr = products.map(item => `Name: ${item.product}\nPrice: ${item.price}\nLocation: ${item.location}`).join('\n\n');
    const message = `${header}${itemsStr}`;
    return message;
  }

  sendMessage(chatId: number, message: string) {
    if (message) {
      if (message.length > 4096) {
        const msgChunks = this.chunkSubstr(message, 4096);
        msgChunks.forEach(chunk => this.bot.telegram.sendMessage(chatId, chunk));
      } else {
        this.bot.telegram.sendMessage(chatId, message);
      }
    }
  }

  sendYad2ProductsMessageToAll(header: string, products: Yad2Product[]) {
    const message = this.yad2ProductsToText(header, products);
    this.sendMessageToAllSubscribedUsers(message);
  }

  sendMessageToAllSubscribedUsers(message: string) {
    this._dbManager.findAllTelegramUsers(users => {
      users.forEach(user => this.sendMessage(user.chatId, message));
    });
  }

  private chunkSubstr(str: string, size: number): string[] {
    const numChunks = Math.ceil(str.length / size);
    const chunks = new Array(numChunks);

    for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
      chunks[i] = str.substr(o, size);
    }

    return chunks;
  }
}
