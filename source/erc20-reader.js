const EventReaderBase = require("./event-reader-base");
const AddressFilter = require("./address-filter");
const Erc20EventFilter = require("./erc20-event-filter");

module.exports = function(RED) {
    const eventReaderBase = new EventReaderBase(RED, getFilter);
    RED.nodes.registerType("erc20-reader", eventReaderBase.createNode);

    function getFilter(config, msg, node) {
        return Erc20EventFilter.getFilterForEvent(
            config.contractEvent,
            AddressFilter.getFilterFrom(config, msg),
            AddressFilter.getFilterTo(config, msg));
    }
}