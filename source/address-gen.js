const Web3 = require("web3");

module.exports = function(RED) {
    RED.nodes.registerType("address-gen", AddressGen);

    function AddressGen(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", handleInputMessage);

        function handleInputMessage(msg, send, done) {
            try {
                msg.payload = new Web3().eth.accounts.create().address;
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        }
    }
}