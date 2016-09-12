import {SubscriptionAccount, getSubscriptionAccount} from './models/wechat-subscription-account';
import {WechatArticle} from './models/wechat-article';
import * as fs from 'fs';

console.log('Looking for account: zealertech');
getSubscriptionAccount('zealertech')
    .then((resultAccount: SubscriptionAccount) => {
        if (resultAccount) {
            console.log('Account found. Start populate article urls.');
            resultAccount.getLatestArticles().then((articles: Array<WechatArticle>) => {
                let content = JSON.stringify(articles);
                fs.writeFileSync('./test.json', content);
                console.log('Write resutls into test.json');
            }, (err) => {
                fs.writeFileSync('error.txt', err);
            });
        } else {
            console.log('No result is found');
        }
    })
    .catch((err: string) => {
        fs.writeFileSync('error.txt', err);    
    });
