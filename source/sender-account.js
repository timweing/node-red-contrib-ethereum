const TxManager = require("./transaction-manager");

module.exports = function(RED) {
    RED.nodes.registerType("sender-account", SenderAccount,{ credentials: { privateKey: { type: "password" } } });

    function SenderAccount(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        // Write id of this config node to global context so we can find it when configuring sender account in other nodes dynamically with msg.senderAccount
        node.context().global.set(`SenderAccount${config.name.replace(/ /g,'')}`, node.id);

        const ethereumClient = RED.nodes.getNode(config.ethereumClient);
        ethereumClient.getWeb3().then(initialize).catch(e => node.error(e));

        async function initialize(web3) {
            try {
                validateAddress();
                node.address = config.address;

                if (!config.managedByEthereumClient) {
                    addAccountToWallet();
                    const txManager = await createTransactionManager();

                    node.sendTransaction = async function(txObject, options, onTxHashCallback) {
                        validateSenderAddress(options);
                        return txManager.sendTransaction(txObject, options, onTxHashCallback);
                    }
                }
                else {
                    node.sendTransaction = async function(txObject, options, onTxHashCallback) {
                        validateSenderAddress(options);
                        const multiEventPromise = txObject.send(options);
                        multiEventPromise.on("transactionHash", onTxHashCallback);
                        return multiEventPromise;
                    }
                }
            }
            catch (e) {
                node.error(e);
            }

            function validateAddress() {
                if (!web3.utils.isAddress(config.address.toLowerCase())) {
                    throw new Error(`Not a valid ethereum address '${config.address}'`);
                }
                if (!web3.utils.checkAddressChecksum(config.address)) {
                    throw new Error(`Address checksum validation failed '${config.address}'`);
                }
            }

            function addAccountToWallet() {
                try {
                    node.log(`Adding account '${config.address}' to in-memory wallet`);
                    const account = web3.eth.accounts.wallet.add(node.credentials.privateKey);
                    if (account.address !== config.address) {
                        throw Error(`Public and private key mismatch`);
                    }
                }
                catch(e) {
                    node.error(e);
                    throw Error(`Failed to add account '${config.address}' to in-memory wallet.`);
                }
            }

            async function createTransactionManager() {
                try {
                    return new TxManager(await web3.eth.getTransactionCount(config.address), config.transactionQueueSize);
                }
                catch(e) {
                    node.error(e);
                    throw Error("Failed to initialize transaction manager.");
                }
            }

            function validateSenderAddress(options) {
                // To lower case for comparison. Ethereum addresses are not case-sensitive per se, but often are written with upper and lower case letters mixed for checksum validation.
                if (options.from.toLowerCase() !== node.address.toLowerCase()) {
                    throw Error(`Options contain wrong sender address. Expected '${node.address}' but found '${options.from}'`);
                }
            }
        }
    }
}