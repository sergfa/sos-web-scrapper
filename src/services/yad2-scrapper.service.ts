import { ScriptSnapshot } from "typescript";
import axios from 'axios';
import jsdom from 'jsdom';
import { Yad2Product } from "../interfaces/yad2-product.interface";
import randomUseragent from 'random-useragent';

class Yad2ScrapperService {

    private BASE_URL = 'https://www.yad2.co.il/products/all';
    private USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36';
//    https://www.yad2.co.il/products/all?area=25&category=30&item=1050
    constructor(private category: string = '30', private item: string = '1050', private area?: string){}

    public async scrap(): Promise<Yad2Product []> {
        let url = `${this.BASE_URL}?category=${this.category}&item=${this.item}`;
        if(this.area) {
            url = `${url}&area=${this.area}`;
        }
        try {
            const userAgent = randomUseragent.getRandom();
            console.log(userAgent);
            const {data} = await axios.get(url, { headers: { 'User-Agent': userAgent}});
            const  dom  = new jsdom.JSDOM(data);
            const feedItems = Array.from(dom.window.document.querySelectorAll<HTMLElement>('#__layout > div > main > div > div.main_body > div.inner_content > div.column_large > div.feed_list.new_gallery_view_design > div.feeditem.table'));
            console.log('items', feedItems.length);
            const items = feedItems.map(feedItem => {
                const price = feedItem.querySelector<HTMLElement>('div.price').textContent;
                const product = feedItem.querySelector<HTMLElement>('div.row-1').textContent;
                const location = feedItem.querySelector<HTMLElement>('div.val').textContent;
                const id = feedItem.querySelector("div[item-id]").getAttribute('item-id');
                return {price,product, location,id};               
            });
           return items;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }


    private handleError(error: any): void{
        if (error.response) {
            /*
             * The request was made and the server responded with a
             * status code that falls out of the range of 2xx
             */
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
        } else if (error.request) {
            /*
             * The request was made but no response was received, `error.request`
             * is an instance of XMLHttpRequest in the browser and an instance
             * of http.ClientRequest in Node.js
             */
            console.log(error.request);
        } else {
            // Something happened in setting up the request and triggered an Error
            console.log('Error', error.message);
        }
        console.log(error);
    }
}


export default Yad2ScrapperService;