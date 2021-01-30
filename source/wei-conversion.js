const Web3 = require("web3");

module.exports = function(RED) {
    RED.nodes.registerType("wei-conversion", WeiConversion);

    function WeiConversion(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", convert);

        function convert(msg, send, done) {
            try {
                const web3 = new Web3();
                if (config.conversion === "from-wei") {
                    msg.payload = web3.utils.fromWei(web3.utils.toBN(msg.payload), config.toUnit).toString();
                }
                else if (config.conversion === "to-wei") {
                    msg.payload = web3.utils.toWei(web3.utils.toBN(msg.payload), config.fromUnit).toString();
                }

                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        }
    }
}