import * as needle from 'needle';
import * as cheerio from 'cheerio';

const nameSelector = 'h3';
const wechatIdSelector = 'label[name="em_weixinhao"]';
const subscriptionItemClass = '.wx-rb.bg-blue.wx-rb_v1._item';

export class SubscriptionAccount {
    name: string
    articleUrl: string
    constructor(public wechatId: string) {
    }
    /**
     * Craw the wechat account and grab the article page.
     */
    crawl() {
        let options = {follow_max: 5, follow_set_cookies: true};
        let sogouSearchUrl = 'http://weixin.sogou.com/weixin?type=1&query=' + this.wechatId;
        
        needle.get(sogouSearchUrl, options, (error: any, httpResponse: any) => {
            if (error) {
                console.error('Failed to retrieve content from the given url.');
                return;
            }
            
            if (httpResponse.statusCode === 200) {
                // Successfully retrieve the result.
                let responseHTML = cheerio.load(httpResponse.body);
                let subscriptionItem = responseHTML(subscriptionItemClass);
                while (subscriptionItem.length > 0) {
                    if (subscriptionItem.find(wechatIdSelector).length > 0) {
                        let resultWechatId = subscriptionItem.find(wechatIdSelector).text();
                        if (resultWechatId !== this.wechatId) {
                            subscriptionItem = subscriptionItem.next();
                            continue;
                        }
                        this.name = subscriptionItem.find(nameSelector).text();
                        this.articleUrl = subscriptionItem.attr('href');
                        break;
                    }
                    subscriptionItem = subscriptionItem.next();
                }
            }
        });
    }
}