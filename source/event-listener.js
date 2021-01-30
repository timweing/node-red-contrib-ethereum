const EventListenerBase = require("./event-listener-base");
const EventFilter = require("./event-filter");

module.exports = function(RED) {
    const eventListenerBase = new EventListenerBase(RED, getFilter);
    RED.nodes.registerType("event-listener", eventListenerBase.createNode);

    function getFilter(config, node) {
        return config.filter ? EventFilter.parseFilter(config.filter, node) : undefined;
    }
}