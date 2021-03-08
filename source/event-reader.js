const EventReaderBase = require("./event-reader-base");
const ParseInput = require("./parse-input");

module.exports = function(RED) {
    const eventReaderBase = new EventReaderBase(RED, getFilter);
    RED.nodes.registerType("event-reader", eventReaderBase.createNode);

    function getFilter(config, msg, node) {
        if (config.filter) {
            return ParseInput.parseJsonString(config.filter, node);
        }
        else if (msg.hasOwnProperty("filter")) {
            return msg.filter;
        }
        return undefined;
    }
}