import * as needle from 'needle';
import * as cheerio from 'cheerio';
import {WechatArticle} from './wechat-article';

const AccountSelectors = {
    NAME: 'h3',
    IMG: '.img-box img',
    BASE: '.wx-rb.bg-blue.wx-rb_v1._item',
    WECHAT_ID: 'label[name="em_weixinhao"]'
};

export function getSubscriptionAccount(wechatId: string): Promise<SubscriptionAccount> {
    let options = { follow_max: 5, follow_set_cookies: true };
    let sogouSearchUrl = 'http://weixin.sogou.com/weixin?type=1&query=' + wechatId;
    let promise = new Promise<SubscriptionAccount>((resolve, reject) => {
        needle.get(sogouSearchUrl, options, (error: any, httpResponse: any) => {
            if (error) {
                reject('Failed to retrieve content from the given url.');
                return;
            }

            if (httpResponse.statusCode === 200) {
                // Successfully retrieve the result.
                let responseHTML = cheerio.load(httpResponse.body);
                let subscriptionItem = responseHTML(AccountSelectors.BASE);
                while (subscriptionItem.length > 0) {
                    if (subscriptionItem.find(AccountSelectors.WECHAT_ID).length > 0) {
                        let resultWechatId = subscriptionItem.find(AccountSelectors.WECHAT_ID).text();
                        if (resultWechatId !== this.wechatId) {
                            subscriptionItem = subscriptionItem.next();
                            continue;
                        }

                        let name = subscriptionItem.find(AccountSelectors.NAME).text();
                        let resultUrl = subscriptionItem.attr('href');
                        let accountImage = subscriptionItem.find(AccountSelectors.IMG).attr('src');
                        let account = new SubscriptionAccount(name, resultUrl, accountImage);
                        resolve(account);
                        return;
                    }
                    subscriptionItem = subscriptionItem.next();
                }
            } 
            
            reject(httpResponse.body);
        });
    });
    return promise;
}

const ArticleSelectors = {
    ITEM: 'weui_media_box appmsg h4.weui_media_title'
}
const WECHAT_BASE_URL = 'http://mp.weixin.qq.com/';

export class SubscriptionAccount {
    constructor(public name: string, public resultUrl: string, public accountImage: string) {
    }

    getLatestArticles(): Promise<Array<WechatArticle>> {
        let options = { follow_max: 5, follow_set_cookies: true };
        let promise = new Promise<Array<WechatArticle>>((resolve, reject) => {
            needle.get(this.resultUrl, options, (error: any, httpResponse: any) => {
                if (error) {
                    reject('Failed to retrieve content from the given url.');
                    return;
                }

                if (httpResponse.statusCode === 200) {
                    let promises: Array<Promise<WechatArticle>> = [];
                    // Successfully retrieve the result.
                    let responseHTML = cheerio.load(httpResponse.body);
                    let subscriptionItem = responseHTML(ArticleSelectors.ITEM);
                    while (subscriptionItem.length > 0) {
                        let hrefs = subscriptionItem.attr('hrefs');
                        let name = subscriptionItem.text();
                        if (hrefs && hrefs.length > 0) {
                            promises.push(parseArticleUrl(name, WECHAT_BASE_URL + hrefs));
                        }
                        subscriptionItem = subscriptionItem.next();
                    }
                    Promise.all<WechatArticle>(promises).then((results: Array<WechatArticle>) => {
                        resolve(results.filter((item) => !!item));
                    }, (err) => {
                        reject(err);
                    });
                    return;
                }
                resolve([]);
            });
        });
        return promise;
    }
}

function parseArticleUrl(name: string, url: string): Promise<WechatArticle> {
    let options = { follow_max: 5, follow_set_cookies: true };
    let promise = new Promise<WechatArticle>((resolve, reject) => {
        needle.get(this.resultUrl, options, (error: any, httpResponse: any) => {
            if (error) {
                reject('Failed to retrieve content from the griven url.');
                return;
            }

            if (httpResponse.statusCode === 200) {
                // Successfully retrieve the result.
                let responseHTML = cheerio.load(httpResponse.body);
                let account = new WechatArticle(name, url);
                account.content = responseHTML.html();
                resolve(account);
            }
            resolve(null);
        });
    });
    return promise;
}