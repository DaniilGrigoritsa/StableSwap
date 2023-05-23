const SupportedBlockchainsData = {
    "137": {
        "StableSwap": "0xDBd575758f40C00528b91756eaeD36D5B6620635",
        "StargateRouter": "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
        "tokens": [
            {
                "name": "USDC",
                "address": "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
                "poolId": 1,
                "logo": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025"
            },
            {
                "name": "USDT",
                "address": "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
                "poolId": 2,
                "logo": "https://cryptologos.cc/logos/tether-usdt-logo.png?v=025"
            },
            {
                "name": "DAI",
                "address": "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
                "poolId": 3,
                "logo": "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=025",
            }
        ],
        "chainName": "matic",
        "fullname": "Polygon",
        "chainId": "109",
        "logo": "https://cryptologos.cc/logos/polygon-matic-logo.png?v=025"
    },
    "42161": {
        "StableSwap": "",
        "StargateRouter": "0x53Bf833A5d6c4ddA888F69c22C88C9f356a41614",
        "tokens": [
            {
                "name": "USDC",
                "address": "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
                "poolId": 1,
                "logo": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
            },
            {
                "name": "USDT",
                "address": "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
                "poolId": 2,
                "logo": "https://cryptologos.cc/logos/tether-usdt-logo.png?v=025",
            },
        ],
        "chainName": "arb",
        "fullname": "Arbitrum",
        "chainId": "110",
        "logo": "https://cryptologos.cc/logos/arbitrum-arb-logo.png?v=025"
    },
    "43114": {
        "StableSwap": "",
        "StargateRouter": "0x45A01E4e04F14f7A4a6702c74187c5F6222033cd",
        "tokens": [
            {
                "name": "USDC",
                "address": "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
                "poolId": 1,
                "logo": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=025",
            },
            {
                "name": "USDT",
                "address": "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7",
                "poolId": 2,
                "logo": "https://cryptologos.cc/logos/tether-usdt-logo.png?v=025",
            },
        ],
        "chainName": "avax",
        "fullname": "Avalanche",
        "chainId": "106",
        "logo": "https://cryptologos.cc/logos/avalanche-avax-logo.png?v=025"
    }
}

export default SupportedBlockchainsData;