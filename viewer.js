import {WebSocketServer} from 'ws'
import connect from 'connect'
import {cwd} from 'node:process';
import serveStatic from 'serve-static'
import {
    addKeyword,
    addProductId,
    getActiveKeyword,
    getDiff,
    getKeywords,
    getProductIds,
    getProductStats,
    getStats
} from "./repo_sqlite.js";

/**
 * Simple web server
 */
const port = 80

connect()
    .use(serveStatic(cwd()))
    .listen(port, () => console.log('Open your browser\n http://127.0.0.1'));

/**
 * WebSocket server
 */
const wss = new WebSocketServer({port: 9000})
wss.on('connection', async function (ws) {
    ws.send(JSON.stringify({type: 'connection', data: true}))

    const products = await getProductIds();

    ws.on('message', async function (message) {
        message = JSON.parse(message)
        if (message.type === 'ping') {
            ws.send(JSON.stringify({type: 'ping', data: 'pong'}))
        }
        if (message.type === 'get.keywords') {
            const activeKeys = await getActiveKeyword();
            const keywords = await getKeywords(message.data.products, activeKeys);

            keywords.sort((a, b) => a.position - b.position)
            ws.send(JSON.stringify({type: 'keywords', data: keywords}))
        }
        if (message.type === 'get.product.data') {
            const productStats = await getProductStats(message.data.products[0])
            ws.send(JSON.stringify({type: 'product.data', data: productStats}))
        }
        if (message.type === 'get.products') {
            ws.send(JSON.stringify({type: 'products', data: products}))
        }
        if (message.type === 'get.stats') {
            const stats = await getStats(message.data.products, message.data.keywords);
            const diff = await getDiff(message.data.products);

            ws.send(JSON.stringify({type: 'stats', data: stats, productDiff: diff}))
        }

        if (message.type === 'add.product') {
            await addProductId(message.data.product);
            try {
                products.push(message.data.product);
            } catch (e) {
                console.log(e)
            }

            ws.send(JSON.stringify({type: 'products', data: products}));
        }

        if (message.type === 'add.keyword') {
            try {
                await addKeyword(message.data.keyword)
            } catch (e) {
                console.log(e)
            }
        }
    })
})