import './style/app.scss';
import 'antd/dist/antd.css';
import { Button, Select, Space, Table, Tabs } from 'antd';
import binanceAPI from './utils/binance';
import { useEffect, useState } from 'react';
const { Option } = Select;

const dataSource = [
    {
        volume: 7148,
        entryPrice: 0.001436,
        symbol: 'WINUSDT',
        currentPrice: 0,
        pnl: 0,
    },
    {
        volume: 0.0538,
        entryPrice: 568.3,
        symbol: 'BNBUSDT',
        currentPrice: 0,
        pnl: 0,
    },
];

const Home = () => {
    const [symbols, setSymbols] = useState([]);
    const [data, setData] = useState(dataSource);
    const [total, setTotal] = useState();

    useEffect(() => {
        getSymbols();
    }, []);

    useEffect(() => {
        var interval = setInterval(async () => {
            let _data = data.slice();
            var total = 0;

            const new_data = await Promise.all(
                _data.map(async (item) => {
                    const price = await getPrice(item.symbol);

                    const pnl = profitCalculate(
                        item.volume,
                        item.entryPrice,
                        price
                    );

                    total += profitCalculate(item.volume, 0, price);

                    return {
                        ...item,
                        currentPrice: price,
                        pnl: pnl,
                    };
                })
            );

            console.log(new_data);
            setTotal(total);
            setData(new_data);
        }, 1000);
    }, []);

    const getSymbols = async () => {
        const _symbols = await binanceAPI.getSymbols();

        setSymbols(_symbols);
    };

    const getPrice = (symbol) => {
        const price = binanceAPI.getPrice(symbol);

        return price;
    };

    const profitCalculate = (volume, entryPrice, currentPrice) => {
        return (volume * (currentPrice - entryPrice) * 99.9) / 100;
    };

    const columns = [
        {
            title: 'Pairs',
            dataIndex: 'symbol',
            key: 'symbol',
        },
        {
            title: 'Volume',
            dataIndex: 'volume',
            key: 'volume',
            sorter: (a, b) => a.volume - b.volume,
        },
        {
            title: 'Entry price',
            dataIndex: 'entryPrice',
            key: 'entryPrice',
            render: (pnl) => (
                <>{(Math.round(pnl * 1000) / 1000).toFixed(3)} $</>
            ),
        },

        {
            title: 'Current price',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (pnl) => (
                <>{(Math.round(pnl * 1000) / 1000).toFixed(3)} $</>
            ),
        },
        {
            title: 'PNL',
            dataIndex: 'pnl',
            key: 'pnl',
            render: (pnl) => <>{(Math.round(pnl * 100) / 100).toFixed(2)} $</>,
        },
    ];
    return (
        <div className='home-page'>
            <Button>
                {(Math.round((total + 0.03) * 100) / 100).toFixed(2)} $
            </Button>
            <div className='home-box'>
                <Select
                    showSearch
                    optionFilterProp='children'
                    filterOption={(input, option) =>
                        option.props.children
                            .toLowerCase()
                            .indexOf(input.toLowerCase()) >= 0
                    }>
                    {symbols.map((symbol) => {
                        return (
                            <Option value={symbol} key={symbol}>
                                {symbol}
                            </Option>
                        );
                    })}
                </Select>
                <Table columns={columns} dataSource={data} />
            </div>
        </div>
    );
};

export default Home;
