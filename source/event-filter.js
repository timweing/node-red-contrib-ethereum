module.exports = {
    parseFilter
}

function parseFilter(raw, node) {
    try {
        return JSON.parse(raw);
    }
    catch(e) {
        node.error(e);
        throw Error(`Failed to parse filter '${raw}'`);
    }
}