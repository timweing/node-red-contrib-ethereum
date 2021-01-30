const EventReaderBase = require("./event-reader-base");
const EventFilter = require("./event-filter");

module.exports = function(RED) {
    const eventReaderBase = new EventReaderBase(RED, getFilter);
    RED.nodes.registerType("event-reader", eventReaderBase.createNode);

    function getFilter(config, msg, node) {
        if (config.filter) {
            return EventFilter.parseFilter(config.filter, node);
        }
        else if (msg.hasOwnProperty("filter")) {
            return msg.filter;
        }
        return undefined;
    }
}