import { ProductFinderBot } from '../bots/product-finder.bot';
import { Yad2Product } from '../interfaces/yad2-product.interface';
import { Yad2PPTRService } from '../services/yad2-pptr.service';
import Yad2ScrapperService from '../services/yad2-scrapper.service';

export class Yad2Scrapper {
  private _lastYad2Data: Yad2Product[] = [];
  private _yad2Service: Yad2PPTRService;
  //private _yad2Service: Yad2ScrapperService;
  
  private _runCount = 0;

  get lastYad2Data() {
      return this._lastYad2Data;
  }
  constructor(private category: string = '30', private item: string = '1050', private area?: string) {
    //this._yad2Service = new Yad2ScrapperService(category, item, area);
    this._yad2Service = new Yad2PPTRService(category, item, area);
  
  }

  scrap(bot: ProductFinderBot) {
    this.fetchData(bot);
    setInterval(async () => {
      await this.fetchData(bot);
    }, 60 * 60 * 1000);
  }

  private async fetchData(bot: ProductFinderBot) {
    console.log('Starting yad2 scrapping, time:', new Date().toTimeString(), 'run count', ++this._runCount);
    const currentYad2Data = await this._yad2Service.scrap();
    console.log('Finished yad2 scrapping, time:', new Date().toTimeString());
    console.log('Yad2 data length:', currentYad2Data.length);
    if (currentYad2Data.length > 0) {
      this._lastYad2Data = this._lastYad2Data.filter(item => currentYad2Data.some(currItem => currItem.id === item.id));
      const newData = currentYad2Data.filter(yad2Product => !(this._lastYad2Data.some(item => item.id === yad2Product.id)));
      if (newData.length > 0) {
        console.log(JSON.stringify(newData, null, 4));
        this._lastYad2Data.push(...newData);
        bot.sendYad2ProductsMessageToAll('New products are available at Yad2', newData);
      } else {
        console.log('No new data was found on YAD2');
      }
    } else {
      console.log('No data was found from YAD2');
    }
  }
}
