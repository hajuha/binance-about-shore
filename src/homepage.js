import './style/app.scss';
import 'antd/dist/antd.css';
import { Button, Input, Select, Space, Table, Form, InputNumber } from 'antd';
import binanceAPI from './utils/binance';
import { useEffect, useState } from 'react';
const { Option } = Select;

const dataSource = JSON.parse(localStorage.getItem('dataSource')) || [];

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

                    total += pnl;

                    return {
                        ...item,
                        currentPrice: price,
                        pnl: pnl,
                    };
                })
            );
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
        const diff = (currentPrice) - entryPrice;
        // console.log(diff);
        return (volume * diff * 99.9) / 100;
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
                <>{(Math.round(pnl * 100000) / 100000).toFixed(5)} $</>
            ),
        },

        {
            title: 'Current price',
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: (pnl) => (
                <>{(Math.round(pnl * 100000) / 100000).toFixed(5)} $</>
            ),
        },
        {
            title: 'PNL',
            dataIndex: 'pnl',
            key: 'pnl',
            render: (pnl) => <>{(Math.round(pnl * 100) / 100).toFixed(2)} $</>,
        },
    ];

    const onFinish = (values) => {
        let _data = data;

        const newOrder = {
            volume: values.volume,
            entryPrice: values.entryPrice,
            symbol: values.symbol,
            currentPrice: 0,
            pnl: 0,
        };

        _data.push(newOrder);

        localStorage.setItem('dataSource', JSON.stringify(_data));
        window.location.reload();
    };

    const clearCache = () => {
        localStorage.removeItem('dataSource');
        window.location.reload();
    };

    return (
        <div className='home-page'>
            <div className='home-box'>
                <Form
                    name='basic'
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    className='add-order'>
                    <Form.Item
                        label='Pairs'
                        name='symbol'
                        className='input-field'>
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
                    </Form.Item>
                    <Form.Item
                        label='Volume'
                        name='volume'
                        className='input-field'>
                        <InputNumber />
                    </Form.Item>

                    <Form.Item
                        label='Entry price'
                        name='entryPrice'
                        className='input-field'>
                        <InputNumber />
                    </Form.Item>

                    <div className='buttons'>
                        <Form.Item>
                            <Button
                                type='primary'
                                htmlType='submit'
                                className='submit'>
                                Submit
                            </Button>
                        </Form.Item>

                        <Form.Item>
                            <Button
                                onClick={() => clearCache()}
                                type='primary'
                                className='submit'>
                                Clear cache
                            </Button>
                        </Form.Item>
                    </div>
                </Form>
                <Button className='buttons'>
                    Total profit: {(Math.round(total * 100) / 100).toFixed(2)} $
                </Button>
                <Table columns={columns} dataSource={data} />
            </div>
        </div>
    );
};

export default Home;
