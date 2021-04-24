const Conversion = require("../modules/unit-conversion");

module.exports = function(RED) {
    RED.nodes.registerType("ether-conversion", EtherConversion);

    function EtherConversion(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.on("input", convert);

        function convert(msg, send, done) {
            try {
                msg.payload = Conversion.convertFromTo(msg.payload, config.fromUnit, config.toUnit);
                send(msg);
                done();
            } catch (err) {
                done(err);
            }
        }
    }
}