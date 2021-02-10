const BlockRange = require("./block-range");

module.exports = function(RED) {
    RED.nodes.registerType("transaction-reader", TransactionReader);

    function TransactionReader(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const ethereumClient = RED.nodes.getNode(config.ethereumClient);

        // Don't start processing messages until config node is ready.
        ethereumClient.getWeb3()
            .then(web3 => node.on("input", handleInputMessage))
            .catch(e => node.error(e));

        async function handleInputMessage(msg, send, done) {
            try {
                msg.summary = null; // Clear previous summary (from another node)
                const web3 = await ethereumClient.getWeb3();

                if (config.getByTxHash) {
                    await getByTransactionHash(msg, web3);
                }
                else {
                    await getByBlockRange(msg, web3);
                }
                msg.summary.transactionData = msg.payload;

                send(msg);
                done();
            } catch (err) {
                done(err);
            }

            async function getByTransactionHash(msg, web3) {
                const txHash = msg.payload;
                msg.summary = { transactionHash: txHash };

                if (!txHash) {
                    throw Error("Transaction hash for query can't be be null, undefined or empty.");
                }

                const transaction = await web3.eth.getTransaction(txHash);
                msg.payload = await getTransactionData(transaction, web3);
            }

            async function getByBlockRange(msg, web3) {
                const blockRange = await BlockRange.getBlockRangeConfig(config, msg, web3);
                blockRange.fromBlock = await BlockRange.resolveVariable(blockRange.fromBlock, web3);
                blockRange.toBlock = await BlockRange.resolveVariable(blockRange.toBlock, web3);
                msg.summary = { blockRange: blockRange };

                const transactionData = [];
                for (let blockNumber =  blockRange.fromBlock; blockNumber <= blockRange.toBlock; blockNumber++) {
                    const block = await web3.eth.getBlock(blockNumber, true);
                    for (let transactionIndex = 0; transactionIndex < block.transactions.length; transactionIndex++) {
                        const transaction = block.transactions[transactionIndex];
                        transactionData.push(await getTransactionData(transaction, web3));
                    }
                }

                msg.payload = transactionData;
            }

            async function getTransactionData(transaction, web3) {
                if (config.queryReceipt) {
                    return {
                        transaction: transaction,
                        receipt : transaction ? await web3.eth.getTransactionReceipt(transaction.hash) : null
                    };
                }
                else {
                    return transaction;
                }
            }
        }
    }
}