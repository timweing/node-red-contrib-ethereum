module.exports = function(RED) {
    RED.nodes.registerType("gas-price", GasPrice);

    function GasPrice(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const ethereumClient = RED.nodes.getNode(config.ethereumClient);

        // Don't start processing messages until config node is ready.
        ethereumClient.getWeb3()
            .then(web3 => node.on("input", handleInputMessage))
            .catch(e => node.error(e));

        async function handleInputMessage(msg, send, done) {
            try {
                const web3 = await ethereumClient.getWeb3();
                msg.payload = await web3.eth.getGasPrice();
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        }
    }
}