const Web3 = require("web3");

module.exports = function(RED) {
    RED.nodes.registerType("ethereum-client", EthereumClient);

    function EthereumClient(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.name = config.name;
        let web3Instance = undefined;
        const web3Promises = [];

        // Gets the web3 provider stored in this config node.
        node.getWeb3 = async function() {
            return new Promise((resolve, reject) => {
                if (web3Instance) {
                    resolve(web3Instance);
                }
                else {
                    web3Promises.unshift({ resolve: resolve, reject: reject });
                }
            })
        }

        try {
            const web3 =  getWeb3Instance();
            web3.eth.net.getId().then(id => {
                node.log(`Connection test successful (Ethereum client: '${config.name}', Url: '${config.url}', Id: '${id}')`);
                web3.eth.handleRevert = true; // Must be enabled to get the revert reason from 'require' or 'revert' operations in the contract.
                web3Instance = web3;
                while (web3Promises.length > 0) {
                    web3Promises.pop().resolve(web3Instance);
                }
            }).catch(e => {
                node.error(e);
                const connectionTestFailed = new Error(`Connection test failed (Ethereum client: '${config.name}', Url: '${config.url}')`);
                node.error(connectionTestFailed);
                while (web3Promises.length > 0) {
                    web3Promises.pop().reject(connectionTestFailed);
                }
            });
        }
        catch (e) {
            node.error(e);
            const web3InitError = new Error("Initializing Web3 instance failed");
            node.error(web3InitError);
            while (web3Promises.length > 0) {
                web3Promises.pop().reject(web3InitError);
            }
        }

        function getWeb3Instance() {
            const urlLowerCase = config.url.toLowerCase();
            if (urlLowerCase.startsWith("ws") || urlLowerCase.startsWith("wss")) {
                return getWebsocketProvider();
            }
            else if (urlLowerCase.startsWith("http") || urlLowerCase.startsWith("https")) {
                return getHttpProvider();
            }
            else {
                return getIpcProvider();
            }

            function getWebsocketProvider() {
                node.log("Creating websocket provider");
                const Web3WsProvider = require('web3-providers-ws');
                return new Web3(new Web3WsProvider(config.url, {
                    // Enable auto reconnection
                    reconnect: {
                        auto: true,
                        delay: 5000, // ms
                        maxAttempts: 5,
                        onTimeout: false
                    }
                }));
            }

            function getHttpProvider() {
                node.log("Creating http provider");
                return new Web3(new Web3.providers.HttpProvider(config.url));
            }

            function getIpcProvider() {
                node.log("Creating IPC provider");
                const net = require('net');
                return new Web3(config.url, net);
            }
        }
    }
}