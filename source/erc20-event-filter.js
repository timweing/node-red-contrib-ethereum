module.exports = {
    parseFilter,
    getFilterForEvent
}

function parseFilter(raw) {
    const addresses = raw.split(",").map(e => e.trim());
    return addresses.length > 1 ? addresses : addresses[0];
}

function getFilterForEvent(eventName, filterFrom, filterTo) {
    if (eventName === "Transfer") {
        return getFilterForTransferEvent();
    }
    else if (eventName === "Approval") {
        return getFilterForApprovalEvent();
    }
    return undefined;

    function getFilterForTransferEvent() {
        if (filterFrom && filterTo) {
            return { from: filterFrom, to: filterTo };
        }
        if (filterFrom) {
            return { from: filterFrom };
        }
        if (filterTo) {
            return { to: filterTo };
        }
        return undefined;
    }

    function getFilterForApprovalEvent() {
        if (filterFrom && filterTo) {
            return { owner: filterFrom, spender: filterTo };
        }
        if (filterFrom) {
            return { owner: filterFrom };
        }
        if (filterTo) {
            return { spender: filterTo };
        }
        return undefined;
    }
}