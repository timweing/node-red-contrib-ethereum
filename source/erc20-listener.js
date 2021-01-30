const EventListenerBase = require("./event-listener-base");
const Erc20EventFilter = require("./erc20-event-filter");

module.exports = function(RED) {
    const eventListenerBase = new EventListenerBase(RED, getFilter);
    RED.nodes.registerType("erc20-listener", eventListenerBase.createNode);

    function getFilter(config, node) {
        const filterFrom = config.filterFrom ? Erc20EventFilter.parseFilter(config.filterFrom) : undefined;
        const filterTo = config.filterTo ? Erc20EventFilter.parseFilter(config.filterTo) : undefined;
        return Erc20EventFilter.getFilterForEvent(config.contractEvent, filterFrom, filterTo);
    }
}