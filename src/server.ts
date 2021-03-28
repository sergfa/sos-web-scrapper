import 'dotenv/config';
import App from './app';
import { ProductFinderBot } from './bots/product-finder.bot';
import IndexRoute from './routes/index.route';
import { Yad2Scrapper } from './scrappers/yad2.scrapper';
import validateEnv from './utils/validateEnv';

validateEnv();

const yad2Scrapper = new Yad2Scrapper();

const productFinderBot: ProductFinderBot = new ProductFinderBot(yad2Scrapper);
const app = new App([new IndexRoute() /*, new UsersRoute(), new AuthRoute()*/]);
yad2Scrapper.scrap(productFinderBot);
app.listen();

// Enable graceful stop
process.once('SIGINT', () => productFinderBot.bot.stop('SIGINT'));
process.once('SIGTERM', () => productFinderBot.bot.stop('SIGTERM'));
