"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const jsdom_1 = __importDefault(require("jsdom"));
const random_useragent_1 = __importDefault(require("random-useragent"));
class Yad2ScrapperService {
    //    https://www.yad2.co.il/products/all?area=25&category=30&item=1050
    constructor(category = '30', item = '1050', area) {
        this.category = category;
        this.item = item;
        this.area = area;
        this.BASE_URL = 'https://www.yad2.co.il/products/all';
        this.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
    }
    async scrap() {
        let url = `${this.BASE_URL}?category=${this.category}&item=${this.item}`;
        if (this.area) {
            url = `${url}&area=${this.area}`;
        }
        try {
            const userAgent = random_useragent_1.default.getRandom();
            console.log(userAgent);
            const { data } = await axios_1.default.get(url, { headers: { 'User-Agent': userAgent } });
            const dom = new jsdom_1.default.JSDOM(data);
            const feedItems = Array.from(dom.window.document.querySelectorAll('#__layout > div > main > div > div.main_body > div.inner_content > div.column_large > div.feed_list.new_gallery_view_design > div.feeditem.table'));
            console.log('items', feedItems.length);
            const items = feedItems.map(feedItem => {
                const price = feedItem.querySelector('div.price').textContent;
                const product = feedItem.querySelector('div.row-1').textContent;
                const location = feedItem.querySelector('div.val').textContent;
                const id = feedItem.querySelector("div[item-id]").getAttribute('item-id');
                return { price, product, location, id };
            });
            return items;
        }
        catch (error) {
            this.handleError(error);
            return [];
        }
    }
    handleError(error) {
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        }
        else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            console.log(error.request);
        }
        else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
        console.log(error);
    }
}
exports.default = Yad2ScrapperService;
//# sourceMappingURL=yad2-scrapper.service.js.map