import {SubscriptionAccount} from './models/wechat-subscription-account';
let account = new SubscriptionAccount('IrisMagazine');
account.crawl()
    .then((updatedAccount: SubscriptionAccount) => {
        console.log('Crawed: ' + account.articleUrl);
    })
    .catch((err: string) => console.error(err));
