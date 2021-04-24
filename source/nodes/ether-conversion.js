const Web3 = require("web3");

module.exports = function(RED) {
    RED.nodes.registerType("ether-conversion", EtherConversion);

    function EtherConversion(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", convert);

        function convert(msg, send, done) {
            try {
                const web3 = new Web3();
                const wei = web3.utils.toWei(web3.utils.toBN(msg.payload), config.fromUnit);
                msg.payload = web3.utils.fromWei(wei, config.toUnit).toString();
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        }
    }
}