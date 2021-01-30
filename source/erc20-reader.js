const EventReaderBase = require("./event-reader-base");
const Erc20EventFilter = require("./erc20-event-filter");

module.exports = function(RED) {
    const eventReaderBase = new EventReaderBase(RED, getFilter);
    RED.nodes.registerType("erc20-reader", eventReaderBase.createNode);

    function getFilter(config, msg, node) {
        return Erc20EventFilter.getFilterForEvent(config.contractEvent, getFilterFrom(), getFilterTo());

        function getFilterFrom() {
            if (config.filterFrom) {
                return Erc20EventFilter.parseFilter(config.filterFrom);
            }
            else if (msg.hasOwnProperty("filterFrom")) {
                return msg.filterFrom;
            }
            return undefined;
        }

        function getFilterTo() {
            if (config.filterTo) {
                return Erc20EventFilter.parseFilter(config.filterTo);
            }
            else if (msg.hasOwnProperty("filterTo")) {
                return msg.filterTo;
            }
            return undefined;
        }
    }
}