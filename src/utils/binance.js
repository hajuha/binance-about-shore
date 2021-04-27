import axios from 'axios';

export default {
    getSymbols: async () => {
        const res = await axios({
            method: 'GET',
            url: 'https://api3.binance.com/api/v3/ticker/price',
            headers: {},
        });

        var symbols = res.data.map((item) => {
            return item.symbol;
        });

        return symbols;
    },
    getPrice: async (symbol) =>
        await axios({
            method: 'GET',
            url: 'https://api3.binance.com/api/v3/ticker/price',
            headers: {},
            params: {
                symbol: symbol,
            },
        }).then((res) => {
            return res.data.price;
        }),
};
