import 'dotenv/config';
import App from './app';
import { ProductFinderBot } from './bots/product-finder.bot';
import IndexRoute from './routes/index.route';
import { SpeedTestScrapper } from './scrappers/speed-test.scrapper';
import { Yad2Scrapper } from './scrappers/yad2.scrapper';
import validateEnv from './utils/validateEnv';
const Influx = require('influx');

validateEnv();

const influx = new Influx.InfluxDB({
  host: 'localhost',
  database: 'test_speed_db',
  schema: [
    {
      measurement: 'test_speed_result',
      fields: {
        server: Influx.FieldType.STRING,
        ips: Influx.FieldType.STRING,
        ping: Influx.FieldType.FLOAT,
        download: Influx.FieldType.FLOAT,
        upload: Influx.FieldType.FLOAT,
        packetLoss: Influx.FieldType.FLOAT,
      },
      tags: ['host'],
    },
  ],
});

influx
  .getDatabaseNames()
  .then(names => {
    if (!names.includes('test_speed_db')) {
      return influx.createDatabase('test_speed_db');
    }
  })
  .then(() => {
    const speedTestScrapper = new SpeedTestScrapper(15, influx);
    speedTestScrapper.scrap();
  })
  .catch(err => {
    console.error(`Error creating Influx database!`);
  });

//const yad2Scrapper = new Yad2Scrapper();

//const productFinderBot: ProductFinderBot = new ProductFinderBot(yad2Scrapper);
const app = new App([new IndexRoute() /*, new UsersRoute(), new AuthRoute()*/]);
//yad2Scrapper.scrap(productFinderBot);
app.listen();

// Enable graceful stop
//process.once('SIGINT', () => productFinderBot.bot.stop('SIGINT'));
//process.once('SIGTERM', () => productFinderBot.bot.stop('SIGTERM'));
