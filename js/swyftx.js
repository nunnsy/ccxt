'use strict';

//  ---------------------------------------------------------------------------

const Exchange = require ('./base/Exchange');
const { ArgumentsRequired, ExchangeError, OrderNotFound, InvalidOrder, InsufficientFunds, DDoSProtection, BadRequest, AuthenticationError } = require ('./base/errors');
const { AuthenticationError } = require ('./base/errors');
const Precise = require ('./base/Precise');

//  ---------------------------------------------------------------------------

module.exports = class swyftx extends Exchange {
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'swyftx',
            'name': 'Swyftx',
            'countries': [ 'AU' ], // Australia
            'rateLimit': 1000, // TODO: No mention of rate limit, need to contact
            'version': 'v1.110.3',
            'has': {
                'loadMarkets': true,
                'cancelAllOrders': 'emulated',
                'cancelOrder': true,
                'cancelOrders': 'emulated',
                'CORS': undefined,
                // 'createDepositAddress': undefined, // TODO: add
                'createLimitOrder': true,
                'createMarketOrder': true,
                'createOrder': true,
                'deposit': undefined,
                'editOrder': 'emulated',
                'fetchBalance': true,
                'fetchBidsAsks': undefined,
                'fetchCurrencies': undefined,
                'fetchDepositAddress': undefined,
                'fetchDeposits': undefined,
                'fetchFundingFees': undefined,
                'fetchL2OrderBook': false,
                'fetchLedger': undefined,
                'fetchMarkets': true,
                'fetchMyTrades': undefined,
                'fetchOHLCV': true,
                'fetchOpenOrders': undefined,
                'fetchOrder': undefined,
                'fetchOrderBook': true,
                'fetchOrderBooks': undefined,
                'fetchOrders': undefined,
                'fetchOrderTrades': undefined,
                'fetchStatus': 'emulated',
                'fetchTicker': true,
                'fetchTickers': undefined,
                'fetchTime': undefined,
                'fetchTrades': true,
                'fetchTradingFee': true,
                'fetchTradingFees': undefined,
                'fetchTradingLimits': undefined,
                'fetchTransactions': undefined,
                'fetchWithdrawals': true,
                'privateAPI': true,
                'publicAPI': true,
                'withdraw': true,
            },
            'urls': {
                'logo': '', // TODO: add
                'test': {
                    'public': 'https://api.demo.swyftx.com.au',
                    'private': 'https://api.demo.swyftx.com.au',
                },
                'api': {
                    'public': 'https://api.swyftx.com.au',
                    'private': 'https://api.swyftx.com.au',
                },
                'www': 'https://swyftx.com/au/',
                'doc': [
                    'https://docs.swyftx.com.au/',
                ],
                'fees': 'https://swyftx.com/au/fees/',
            },
            'api': {
                'public': {
                    'get': [
                        'charts/getBars/{baseAsset}/{secondaryAsset}/{side}/?resolution={resolution}&timeStart={timeStart}&timeEnd={timeEnd}&limit={limit}',
                        'live-rates/{asset}/',
                        'markets/assets/', // Can trade any asset against AUD only
                    ],
                },
                'private': {
                    'get': [
                        // '/user/apiKeys/scope/',
                        // 'user/apiKeys/',
                        // 'address/deposit/{assetId}/{networkId}?version=2',
                        // 'address/withdraw/{assetCode}/',
                        // 'address/withdraw/verify/{token}/',
                        // 'address/withdraw/bsb-verify/{bsb}/',
                        // 'address/check/{assetCode}/{addressId}/',
                        'user/balance/',
                        'limits/withdrawal/',
                        'orders/{assetCode}?limit{limit}=&page={page}',
                        'orders/byId/{orderUuid}',
                        'history/withdraw/asset/?limit=&page=&sortBy=',
                        'history/deposit/asset/?limit=&page=&sortBy=',
                        'history/withdraw/?limit=&page=&sortBy=',
                        'history/deposit/?limit=&page=&sortBy=',
                        'history/all/type/assetId/?limit=&page=&sortBy=',
                    ],
                    'post': [
                        'auth/refresh/',
                        'auth/logout/',
                        // 'user/apiKeys/revoke/',
                        // 'user/apiKeys/revokeAll/',
                        'address/deposit/{assetCode}/{variantId}',
                        'address/withdraw/{assetCode}/',
                        'funds/withdraw/{assetCode}/',
                        'orders/',
                    ],
                    'delete': [
                        // 'address/withdraw/{addressId}/'
                        'orders/{orderUuid}/',
                    ],
                    'put': [
                        'orders/',
                    ],
                },
            },
            'timeframes': {
                '1m': '1m',
                '5m': '5m',
                '1h': '1h',
                '4h': '4h',
                '1d': '1d',
            },
            // 'currencies': { }, // to be filled manually or by fetchMarkets
            'fees': {
                'trading': {
                    'tierBased': false,
                    'percentage': true,
                    'taker': this.parseNumber ('0.006'),
                    'maker': this.parseNumber ('0.006'),
                },
                'funding': {
                    'tierBased': false,
                    'percentage': false,
                    'withdraw': {
                        'AUD': 0.0,
                    },
                    'deposit': {
                        'AUD': 0.0,
                    },
                },
            },
            'requiredCredentials': {
                'apiKey': true,
                'secret': false,
            },
            // 'status': {
            //     'status': 'ok',
            //     'updated': undefined,
            //     'eta': undefined,
            //     'url': undefined,
            // },
            // 'exceptions': undefined,
            // 'httpExceptions': {
            //     '422': ExchangeError,
            //     '418': DDoSProtection,
            //     '429': RateLimitExceeded,
            //     '404': ExchangeNotAvailable,
            //     '409': ExchangeNotAvailable,
            //     '410': ExchangeNotAvailable,
            //     '500': ExchangeNotAvailable,
            //     '501': ExchangeNotAvailable,
            //     '502': ExchangeNotAvailable,
            //     '520': ExchangeNotAvailable,
            //     '521': ExchangeNotAvailable,
            //     '522': ExchangeNotAvailable,
            //     '525': ExchangeNotAvailable,
            //     '526': ExchangeNotAvailable,
            //     '400': ExchangeNotAvailable,
            //     '403': ExchangeNotAvailable,
            //     '405': ExchangeNotAvailable,
            //     '503': ExchangeNotAvailable,
            //     '530': ExchangeNotAvailable,
            //     '408': RequestTimeout,
            //     '504': RequestTimeout,
            //     '401': AuthenticationError,
            //     '511': AuthenticationError,
            // },
            // 'commonCurrencies': { // gets extended/overwritten in subclasses
            //     'XBT': 'BTC',
            //     'BCC': 'BCH',
            //     'DRK': 'DASH',
            //     'BCHABC': 'BCH',
            //     'BCHSV': 'BSV',
            // },
            // 'precisionMode': DECIMAL_PLACES,
            // 'paddingMode': NO_PADDING,
            // 'limits': {
            //     'amount': { 'min': undefined, 'max': undefined },
            //     'price': { 'min': undefined, 'max': undefined },
            //     'cost': { 'min': undefined, 'max': undefined },
            // },
        });
    }

    constructor (userConfig = {}) {
        super (userConfig);
        // Used to store the token for API access
        this.jwt_token = undefined;
        this.jwt_token_expiry = undefined;
        this.fetchJWTToken (); // ?: Should this be in the constructor?
    }

    async fetchJWTToken () {
        if (!this.apiKey) {
            throw new AuthenticationError (this.id + ' requires apiKey for all requests');
        }
        const url = this.urls['api'] + '/' + 'auth/refresh/';
        const response = await this.request (url, 'private', 'POST', {}, {}, { 'apiKey': this.apiKey }, {}, {});
        this.jwt_token = response['accessToken'];
        this.jwt_token_expiry = this.milliseconds () + (86400 * 1000); // Set validity for 1 day (exchange says the expire after 7 days)
    }

    sign (path, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        if (!this.jwt_token || this.jwt_token_expiry > this.milliseconds ()) {
            // Refresh the JWT Token
            this.fetchJWTToken ();
        }
        const url = this.urls['api'][api] + '/' + path;
        if (api === 'private') {
            this.checkRequiredCredentials ();
            const nonce = this.nonce ();
            body = this.json (this.extend ({ 'nonce': nonce }, params));
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + this.jwt_token,
            };
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    fetchMarkets (params = {}) {
        const response = this.publicGetMarketAssets (params);
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const market = response[i];
            const baseId = this.safeString (market, 'code');
            if (baseId === 'AUD') {
                // AUD is not a tradable asset
                continue;
            }
            const quoteId = 'AUD';
            const id = this.safeString (market, 'id');
            const base = this.safeCurrencyCode (baseId);
            const quote = this.safeCurrencyCode (quoteId);
            const symbol = base + '/' + quote;
            const fees = this.safeValue (this.safeValue (this.options, 'fees', {}), quote, this.fees); // TODO: Check this works
            const pricePrecision = this.safeInteger (market, 'price_scale');
            const amountPrecision = Math.floor (-1 * Math.log10 (this.safeDecimal (market, 'minimum_order_increment')));
            const precision = {
                'amount': amountPrecision,
                'price': pricePrecision,
            };
            const limits = {
                'amount': {
                    'min': undefined,
                    'max': undefined,
                },
                'price': {
                    'min': undefined,
                    'max': undefined,
                },
                'cost': {
                    'min': undefined,
                    'max': undefined,
                },
            };
            result.push ({
                'info': market,
                'id': id,
                'symbol': symbol,
                'base': base,
                'quote': quote,
                'baseId': baseId,
                'quoteId': quoteId,
                'type': 'spot',
                'spot': true,
                'active': true,
                'maker': fees['maker'],
                'taker': fees['taker'],
                'limits': limits,
                'precision': precision,
            });
        }
        return result;
    }

    parseOHLCV (ohlcv, market = undefined) {
        // {
        //     "time": 1501545600000,
        //     "open": "4261.48000000",
        //     "high": "4745.42000000",
        //     "low": "3400.00000000",
        //     "close": "4724.89000000",
        //     "volume": 10015
        // },
        return [
            this.safeInteger (ohlcv, 'time'),
            this.safeNumber (ohlcv, 'open'),
            this.safeNumber (ohlcv, 'high'),
            this.safeNumber (ohlcv, 'low'),
            this.safeNumber (ohlcv, 'close'),
            this.safeNumber (ohlcv, 'volume'),
        ];
    }

    async fetchOHLCV (symbol, timeframe = '1m', since = undefined, limit = undefined, params = {}) {
        // TODO: Need to figure out how their 'sided' view works
    }

    async createOrder (symbol, type, side, amount, price = undefined, params = {}) {
        const market = this.market (symbol);
        // {
        //     "primary": "USD",
        //     "secondary": "BTC",
        //     "quantity": "1000",
        //     "assetQuantity": "USD",
        //     "orderType": 0,
        //     "trigger": "52000"
        // }
        const request = {
            'primary': 'AUD',
            'secondary': market['id'],
            'quantity': this.amountToPrecision (symbol, amount),
            'assetQuantity': market['id'],
            // 'orderType': 0,
            // 'trigger': "52000"
        };
        if (type === 'limit' || type === 'stop limit') {
            if (price === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a price argument for a ' + type + 'order');
            }
        }
        if (type === 'stop limit') {
            // Price to trigger order at.
            // For limit and stop buy orders (orderType: LIMIT_BUY,STOP_LIMIT_BUY), price is primary per secondary. e.g. 52000 USD/BTC -> trigger: 52000.
            // For limit and stop sell orders (orderType: LIMIT_SELL,STOP_LIMIT_SELL), price is secondary per primary. e.g. 1 BTC / 52000 USD -> trigger: 0.0000192307.
            const triggerPrice = this.safeNumber (params, 'triggerPrice');
            params = this.omit (params, 'triggerPrice');
            if (triggerPrice === undefined) {
                throw new ArgumentsRequired (this.id + ' createOrder() requires a triggerPrice parameter for a ' + type + 'order');
            }
            request['triggerPrice'] = this.priceToPrecision (symbol, triggerPrice);
        }
        const orderType = this.safeString ({
            'limit': 'LIMIT',
            'market': 'MARKET',
            'stop limit': 'STOP_LIMIT',
        }, type, type) + '_' + this.safeString ({
            'buy': 'BUY',
            'sell': 'SELL',
        }, side, side);
        const orderTypes = this.safeValue (this.options, 'orderTypes', {
            'MARKET_BUY': 1,
            'MARKET_SELL': 2,
            'LIMIT_BUY': 3,
            'LIMIT_SELL': 4,
            'STOP_LIMIT_BUY': 5,
            'STOP_LIMIT_SELL': 6,
        });
        request['orderType'] = this.safeInteger (orderTypes, orderType);
        const response = await this.privatePostOrders (this.extend (request, params));
        return this.parseOrder (response, market);
    }

    parseOrder (order, market = undefined) {
        // {
        //     "orderUuid": "ord_4TgCaoJc7pY...",
        //     "order": {
        //       "order_type": 1,
        //       "primary_asset": 2,
        //       "secondary_asset": 293,
        //       "quantity_asset": 293,
        //       "quantity": 4923000,
        //       "trigger": 0.00000923948724,
        //       "status": 1,
        //       "created_time": 1623296438209,
        //       "updated_time": 1623296438200,
        //       "amount": 0.002053467437821649,
        //       "total": 4923000,
        //       "rate": 0.00000923948724,
        //       "aud_value": 99.17152556194523,
        //       "swyftxValue": 99.17132556194522,
        //       "userCountryValue": 76.75975250020123
        //     },
        //     "processed": false
        // }
    }
};
