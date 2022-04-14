import fetch from 'node-fetch';

class WBKeyword {
    constructor(keyword){
        this.keyword = keyword
        this.query = ''
        this.shardKey = ''
    }

    async fetchData(){
        let url = "https://wbxsearch.wildberries.ru/exactmatch/v2/male?query=" + encodeURI(this.keyword)
        let response = await fetch(url)
        let jsonData = await response.json()

        this.query = jsonData.query
        this.shardKey = jsonData.shardKey
    }
}

class WBSearch {
    constructor(keyword){
        this.keyword = keyword
        this.positions = []

        this.params = {
            'page': 1,
            'spp': 19,
            'regions': [69,64,86,83,4,38,30,33,70,22,31,66,68,82,48,1,40,80],
            'stores': [117673,122258,122259,130744,117501,507,3158,124731,121709,120762,117986,159402,2737],
            'pricemarginCoeff': 1.0,
            'reg': 1,
            'appType': 1,
            'offlineBonus': 0,
            'onlineBonus': 0,
            'emp': 0,
            'locale': 'ru',
            'lang': 'ru',
            'curr': 'rub',
            'couponsGeo': [2,6,7,3,19,21,8],
            'dest': [-1059500,-108082,-269701,12358048],
            'sort': 'popular',
            'limit': 300
        }
    }

    async fetchData(){
        let queryParams = new URLSearchParams(this.params).toString()
        let url = 'https://wbxcatalog-ru.wildberries.ru/' + this.keyword.shardKey + '/catalog?' + queryParams + '&' + this.keyword.query
        let response = await fetch(url)
        let jsonData = await response.json()
        this.positions.push(...jsonData.data.products)

        if(jsonData.data.products.length == 300){
            this.params.page += 1
            await this.fetchData()
        }
    }
}

var keywords = [
    'менструальные чаши',
    'чаша для месячных',
    'вагинальная чаша',
    'менструальные трусы',
    'трусы для месячных',
    'прокладки женские',
    'прокладки гигиенические',
    'тампоны'
]

var SKU = [72960860, 71786393, 60059650, 71786349]


for(let keyword of keywords){

    let key = new WBKeyword(keyword)
    await key.fetchData()
    let search = new WBSearch(key)
    await search.fetchData()

    console.info(`Запрос: ${keyword} | Всего: ${search.positions.length}`)

    search.positions.forEach(function(product, idx){
        let idxFound = SKU.indexOf(product.id)
        if (idxFound != -1){
            console.log(`Артикул: ${SKU[idxFound]} | Позиция: ${idx+1}`)
        }
    })
}
