"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yad2Scrapper = void 0;
const yad2_pptr_service_1 = require("../services/yad2-pptr.service");
class Yad2Scrapper {
    constructor(category = '30', item = '1050', area) {
        this.category = category;
        this.item = item;
        this.area = area;
        this._lastYad2Data = [];
        this._runCount = 0;
        this._yad2Service = new yad2_pptr_service_1.Yad2PPTRService(category, item, area);
    }
    get lastYad2Data() {
        return this._lastYad2Data;
    }
    scrap(bot) {
        this.fetchData(bot);
        setInterval(async () => {
            await this.fetchData(bot);
        }, 60 * 60 * 1000);
    }
    async fetchData(bot) {
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
            }
            else {
                console.log('No new data was found on YAD2');
            }
        }
        else {
            console.log('No data was found from YAD2');
        }
    }
}
exports.Yad2Scrapper = Yad2Scrapper;
//# sourceMappingURL=yad2.scrapper.js.map