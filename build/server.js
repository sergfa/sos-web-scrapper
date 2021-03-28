"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = __importDefault(require("./app"));
const index_route_1 = __importDefault(require("./routes/index.route"));
const yad2_scrapper_1 = require("./scrappers/yad2.scrapper");
const validateEnv_1 = __importDefault(require("./utils/validateEnv"));
const product_finder_bot_1 = require("./bots/product-finder.bot");
validateEnv_1.default();
const yad2Scrapper = new yad2_scrapper_1.Yad2Scrapper();
const productFinderBot = new product_finder_bot_1.ProductFinderBot(yad2Scrapper);
const app = new app_1.default([new index_route_1.default() /*, new UsersRoute(), new AuthRoute()*/]);
yad2Scrapper.scrap(productFinderBot);
app.listen();
// Enable graceful stop
process.once('SIGINT', () => productFinderBot.bot.stop('SIGINT'));
process.once('SIGTERM', () => productFinderBot.bot.stop('SIGTERM'));
//# sourceMappingURL=server.js.map