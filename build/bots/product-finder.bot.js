"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductFinderBot = void 0;
const telegraf_1 = require("telegraf");
const db_manager_service_1 = require("../services/db-manager.service");
class ProductFinderBot {
    constructor(_yad2Scrapper) {
        this._yad2Scrapper = _yad2Scrapper;
        this._dbManager = new db_manager_service_1.DBManager();
        this.initBot();
    }
    get bot() {
        return this._bot;
    }
    initBot() {
        this._bot = new telegraf_1.Telegraf(process.env.BOT_TOKEN);
        this.bot.start(ctx => ctx.reply('Welcome, To Find PS5 Israel'));
        this.bot.help(ctx => ctx.reply(`Send /yad2 command to get products from yad2.
         Send /subscribe command to get notifications on new products.
         Send /unsubscribe command to unsubscribe from all notifications.`));
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
                this._dbManager.addTelegramUser({ userId: ctx.from.id, chatId: ctx.chat.id }, () => {
                    ctx.reply(`Congrats! You will get notifications when new products are available.
             To cancel notifications use /unsubscribe command`);
                }, err => {
                    ctx.reply('Unfortunately, we failed to subscribe you, please try again later');
                });
            }
            catch (err) {
                console.log(err);
            }
        });
        this.bot.command('unsubscribe', ctx => {
            this._dbManager.deleteTelegramUser({ userId: ctx.from.id, chatId: ctx.chat.id }, () => {
                ctx.reply('We successfully unsubscribed you from notifications.');
            }, () => {
                ctx.reply('Something went wrong, we failed to unsubscribe you from notifications, please try again later.');
            });
        });
        this.bot.launch();
    }
    yad2ProductsToText(header, products) {
        const itemsStr = products.map(item => `Name: ${item.product}\nPrice: ${item.price}\nLocation: ${item.location}`).join('\n\n');
        const message = `${header}${itemsStr}`;
        return message;
    }
    sendMessage(chatId, message) {
        if (message) {
            if (message.length > 4096) {
                const msgChunks = this.chunkSubstr(message, 4096);
                msgChunks.forEach(chunk => this.bot.telegram.sendMessage(chatId, chunk));
            }
            else {
                this.bot.telegram.sendMessage(chatId, message);
            }
        }
    }
    sendYad2ProductsMessageToAll(header, products) {
        const message = this.yad2ProductsToText(header, products);
        this.sendMessageToAllSubscribedUsers(message);
    }
    sendMessageToAllSubscribedUsers(message) {
        this._dbManager.findAllTelegramUsers(users => {
            users.forEach(user => this.sendMessage(user.chatId, message));
        });
    }
    chunkSubstr(str, size) {
        const numChunks = Math.ceil(str.length / size);
        const chunks = new Array(numChunks);
        for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
            chunks[i] = str.substr(o, size);
        }
        return chunks;
    }
}
exports.ProductFinderBot = ProductFinderBot;
//# sourceMappingURL=product-finder.bot.js.map