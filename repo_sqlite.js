import sqlite from 'aa-sqlite';
import moment from "moment";

await sqlite.open('./main.db');

/**
 * @param productIds {number[]}
 * @param activeKeys {string[]}
 * @returns {Promise<{
 *     keyword: string,
 *     total_products: number,
 *     position: number,
 *     min: number,
 *     max: number,
 *     timestamp: string,
 * }[]>}
 */
export const getKeywords = async function (productIds, activeKeys) {
    const curDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const preDate = moment().add(-4, 'hours').format('YYYY-MM-DD HH:mm:ss');

    const query = `SELECT DISTINCT keyword,
                                   total_products,
                                   position,
                                   min(position) AS min,
                                   max(position) AS max,
                                   max(timestamp),
                                   true          as show
                   FROM (SELECT *
                         FROM stats
                         WHERE product IN (${productIds.join(",")})
                           AND keyword IN ('${activeKeys.join("','")}')
                           AND timestamp BETWEEN "${preDate}" AND "${curDate}")
                   GROUP BY keyword
                   ORDER BY timestamp DESC;`;

    return sqlite.all(query);
}

/**
 * @param keyword {string}
 * @returns {Promise<void>}
 */
export const addKeyword = async function (keyword) {
    const query =
        `insert into keywords (keyword)
         values (?)`;

    return sqlite.push(query, keyword)
}

/**
 * @returns {Promise<string[]>}
 */
export const getActiveKeyword = async function () {
    const keywordRows = await sqlite.all(`SELECT keyword
                                          FROM keywords
                                          GROUP BY query`)

    return keywordRows.map((v) => v.keyword)
}

/**
 * @param productId {number}
 * @returns {Promise<{
 *     product_id: number,
 *     timestamp: string,
 *     data: string,
 *     image: string
 * }>}
 */
export const getProductStats = async function (productId) {
    const query = `SELECT *
                   FROM product_stats
                   WHERE product_id = ${productId}
                   ORDER BY timestamp DESC
                   LIMIT 1`;

    return sqlite.all(query)
}

/**
 * @returns {Promise<number[]>}
 */
export const getProductIds = async function () {
    const query = "SELECT id FROM products";

    return (await sqlite.all(query)).map((v, i) => v.id);
}

/**
 * @param productId
 * @returns {Promise<void>}
 */
export const addProductId = async function (productId) {
    const query =
        `insert into products
         values (?)`;

    return sqlite.push(query, productId)
}

/**
 * @param productIds {number[]}
 * @param keywords {string[]}
 * @returns {Promise<{
 *
 * }>}
 */
export const getStats = async function (productIds, keywords) {
    const query = `
        select strftime('%m%d%H%M', timestamp), timestamp, position, keyword, product, total_products
        from stats
        where product in (${productIds.join(",")})
          and keyword in ('${keywords.join("','")}')
        group by strftime('%m%d%H%M', timestamp), keyword, product
        order by timestamp DESC
        limit 3000`;

    return sqlite.all(query);
}

/**
 * @param keyword {string}
 * @param product {number}
 * @param position {number}
 * @param total_products {number}
 * @returns {Promise<void>}
 */
export const insertStats = async function (keyword, product, position, total_products) {
    let insert = 'INSERT INTO stats(keyword, product, position, total_products) VALUES(?,?,?,?)'
    try {
        await sqlite.push(insert, [keyword, product, position, total_products])
    } catch (err) {
        console.log(err)
    }
}

/**
 * @param productIds {number[]}
 * @returns {Promise<{
 *     product_id: number,
 *     timestamp: string,
 *     data: string,
 *     image: string,
 * }>}
 */
export const getDiff = async function (productIds) {
    const query = `
        select *
        from product_stats
        WHERE product_id in (${productIds.join(",")})
        ORDER BY timestamp ASC`;

    return sqlite.all(query);
}

/**
 * @param product {number}
 * @param data {string}
 * @param imageBase64 {string}
 * @returns {Promise<void>}
 */
export const insertProductStats = async function (product, data, imageBase64) {
    const insert = 'INSERT INTO product_stats(product_id, data, image) VALUES(?,?,?)'
    const response = await sqlite.all(
        `SELECT *
         FROM product_stats
         WHERE product_id = '${product}'
         ORDER BY timestamp DESC
         LIMIT 1`
    );

    if (response.length === 0) {
        try {
            await sqlite.push(insert, [product, data, imageBase64])
        } catch (err) {
            console.log(err)
        }
    } else {
        if (response[0].data !== data || response[0].image !== imageBase64) {
            try {
                await sqlite.push(insert, [...arguments])
            } catch (err) {
                console.log(err)
            }
        }
    }
}

export const updateKeywordTotalProducts = async function (total_products, _query, keyword) {
    let query = "update keywords set total_products = ? , query = ? where keyword = ?"
    try {
        await sqlite.push(query, [...arguments])
    } catch (err) {
        console.log(err)
    }
}