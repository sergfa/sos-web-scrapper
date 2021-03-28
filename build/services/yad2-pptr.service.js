"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Yad2PPTRService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const random_useragent_1 = __importDefault(require("random-useragent"));
class Yad2PPTRService {
    constructor(category = '30', item = '1050', area) {
        this.category = category;
        this.item = item;
        this.area = area;
        this.BASE_URL = 'https://www.yad2.co.il/products/all';
    }
    async startBrowser() {
        let browser;
        try {
            console.log('Opening the browser......');
            browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--disable-setuid-sandbox'],
                ignoreHTTPSErrors: true,
                ignoreDefaultArgs: ['--enable-automation'],
            });
        }
        catch (err) {
            console.log('Could not create a browser instance => : ', err);
        }
        return browser;
    }
    async scrap() {
        let browser;
        let page;
        let url = `${this.BASE_URL}?category=${this.category}&item=${this.item}`;
        if (this.area) {
            url = `${url}&area=${this.area}`;
        }
        try {
            browser = await this.startBrowser();
            page = await browser.newPage();
            const userAgent = random_useragent_1.default.getRandom(function (ua) {
                return ua.folder === '/Browsers - Windows' && ua.browserName !== 'IE';
            });
            console.log(userAgent);
            await page.setUserAgent(userAgent);
            await page.setViewport({ width: 1366, height: 768 });
            console.log(`Navigating to ${url}...`);
            const pageResponse = await page.goto(url);
            let items = await page.evaluate(() => {
                const feedItems = Array.from(document.querySelectorAll('#__layout > div > main > div > div.main_body > div.inner_content > div.column_large > div.feed_list.new_gallery_view_design > div.feeditem.table'));
                console.log('items', feedItems.length);
                const items = feedItems.map(feedItem => {
                    const price = feedItem.querySelector('div.price').textContent;
                    const product = feedItem.querySelector('div.row-1').textContent;
                    const location = feedItem.querySelector('div.val').textContent;
                    const id = feedItem.querySelector('div[item-id]').getAttribute('item-id');
                    return { price, product, location, id };
                });
                return items;
            });
            if (items.length === 0) {
                await page.screenshot({ path: `yad2_error_${new Date().getTime()}.png` });
            }
            await browser.close();
            return items;
        }
        catch (err) {
            if (page) {
                await page.screenshot({ path: `yad2_error_${new Date().getTime()}.png` });
            }
            if (browser) {
                await browser.close();
            }
            console.log('Could not resolve the browser instance => ', err);
            return [];
        }
    }
}
exports.Yad2PPTRService = Yad2PPTRService;
//# sourceMappingURL=yad2-pptr.service.js.map