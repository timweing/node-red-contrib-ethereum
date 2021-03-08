const EventListenerBase = require("./event-listener-base");
const ParseInput = require("./parse-input");
const Erc20EventFilter = require("./erc20-event-filter");

module.exports = function(RED) {
    const eventListenerBase = new EventListenerBase(RED, getFilter);
    RED.nodes.registerType("erc20-listener", eventListenerBase.createNode);

    function getFilter(config, node) {
        const filterFrom = config.filterFrom ? ParseInput.parseCommaSeparatedList(config.filterFrom) : undefined;
        const filterTo = config.filterTo ? ParseInput.parseCommaSeparatedList(config.filterTo) : undefined;
        return Erc20EventFilter.getFilterForEvent(config.contractEvent, filterFrom, filterTo);
    }
}