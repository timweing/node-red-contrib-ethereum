module.exports = {
    parseJsonString,
    parseCommaSeparatedList
}

function parseJsonString(raw, node) {
    try {
        return JSON.parse(raw);
    }
    catch(e) {
        node.error(e);
        throw Error(`Failed to parse filter '${raw}'`);
    }
}

function parseCommaSeparatedList(raw) {
    const entries = raw.split(",").map(e => e.trim());
    return entries.length > 1 ? entries : entries[0];
}