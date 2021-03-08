module.exports = {
    getFilterFrom,
    getFilterTo
}

const ParseInput = require("./parse-input");

function getFilterFrom(config, msg) {
    if (config.filterFrom) {
        return ParseInput.parseCommaSeparatedList(config.filterFrom);
    }
    else if (msg.hasOwnProperty("filterFrom")) {
        return msg.filterFrom;
    }
    return undefined;
}

function getFilterTo(config, msg) {
    if (config.filterTo) {
        return ParseInput.parseCommaSeparatedList(config.filterTo);
    }
    else if (msg.hasOwnProperty("filterTo")) {
        return msg.filterTo;
    }
    return undefined;
}