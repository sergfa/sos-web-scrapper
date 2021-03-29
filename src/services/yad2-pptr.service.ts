import puppeteer, { Browser, Page } from 'puppeteer';
import randomUseragent, { UserAgent } from 'random-useragent';
import { Yad2Product } from '../interfaces/yad2-product.interface';

export class Yad2PPTRService {
  private BASE_URL = 'https://www.yad2.co.il/products/all';

  constructor(private category: string = '30', private item: string = '1050', private area?: string) {}

  async startBrowser(): Promise<Browser> {
    let browser: Browser;
    try {
      console.log('Opening the browser......');
      browser = await puppeteer.launch({
        headless: true,
        product: 'firefox',
        /*args: ['--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        ignoreHTTPSErrors: true,
        ignoreDefaultArgs: ['--enable-automation'],*/
      });
    } catch (err) {
      console.log('Could not create a browser instance => : ', err);
    }
    return browser;
  }

  async scrap(): Promise<Yad2Product[]> {
    let browser: Browser;
    let page: Page;
    let url = `${this.BASE_URL}?category=${this.category}&item=${this.item}`;
    if (this.area) {
      url = `${url}&area=${this.area}`;
    }

    try {
      browser = await this.startBrowser();
      page = await browser.newPage();
      const userAgent = randomUseragent.getRandom(function (ua: UserAgent) {
        return ua.folder === '/Browsers - Windows' && ua.browserName !== 'IE';
      });
      console.log(userAgent);
      await page.setUserAgent(userAgent);
      await page.setViewport({ width: 1366, height: 768 });
      console.log(`Navigating to ${url}...`);
      const pageResponse = await page.goto(url);
      let items = await page.evaluate(() => {
        const feedItems = Array.from(
          document.querySelectorAll<HTMLElement>(
            '#__layout > div > main > div > div.main_body > div.inner_content > div.column_large > div.feed_list.new_gallery_view_design > div.feeditem.table',
          ),
        );
        console.log('items', feedItems.length);
        const items: Yad2Product[] = feedItems.map(feedItem => {
          const price = feedItem.querySelector<HTMLElement>('div.price').textContent;
          const product = feedItem.querySelector<HTMLElement>('div.row-1').textContent;
          const location = feedItem.querySelector<HTMLElement>('div.val').textContent;
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
    } catch (err) {
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
