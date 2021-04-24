const EventListenerBase = require("./event-listener-base");
const ParseInput = require("../modules/parse-input");

module.exports = function(RED) {
    const eventListenerBase = new EventListenerBase(RED, getFilter);
    RED.nodes.registerType("event-listener", eventListenerBase.createNode);

    function getFilter(config, node) {
        return config.filter ? ParseInput.parseJsonString(config.filter, node) : undefined;
    }
}