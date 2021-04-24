module.exports = {
    getBlockRange,
    resolveVariable
}

async function getBlockRange(config, msg, web3) {
    const blockRange = {};
    blockRange.toBlock = parseBlockNumberConfig("toBlock", config, msg);
    validateToBlock(blockRange.toBlock);
    blockRange.fromBlock = await resolveFromBlock(parseBlockNumberConfig("fromBlock", config, msg), blockRange.toBlock);
    return blockRange;

    function parseBlockNumberConfig(configName) {
        let raw;
        if (config[configName]) {
            raw = config[configName];
        }
        else if (msg.hasOwnProperty(configName)) {
            raw = msg[configName];
        }
        else {
            throw Error(`If no static configuration for '${configName}' is provided there must be a dynamic configuration on the input message 'msg.${configName}'`);
        }

        return parseBlockNumber(raw);

        function parseBlockNumber(raw) {
            if (raw === "earliest" || raw === "latest") {
                return raw;
            }
            else {
                const parsed = parseInt(raw);
                if (isNaN(parsed)) {
                    throw Error(`Invalid block number '${raw}' for option '${configName}'`);
                }
                return parsed;
            }
        }
    }

    function validateToBlock(toBlockParsed) {
        if (toBlockParsed !== "latest" && toBlockParsed < 0) {
            throw Error(`Invalid block number '${toBlockParsed}' for 'toBlock'`);
        }
    }

    async function resolveFromBlock(fromBlockParsed, toBlockParsed) {
        if (fromBlockParsed < 0) {
            // If 'fromBlockParsed' is negative it means to get the events from the last few blocks.
            // Example: fromBlockParsed = -10 and toBlockParsed = 'latest' then we want the events from block 'latest' - 10 up to 'latest'.

            if (toBlockParsed === "earliest") {
                throw Error("'fromBlock option can't be negative when 'toBlock' option is 'earliest'");
            }

            if (toBlockParsed !== "latest") {
                return toBlockParsed + fromBlockParsed;
            }

            const latest = await web3.eth.getBlockNumber();
            return latest + fromBlockParsed;
        }
        return fromBlockParsed;
    }
}

async function resolveVariable(blockNumberConfig, web3) {
    if (blockNumberConfig === "earliest") {
        return 0;
    }
    else if (blockNumberConfig === "latest") {
        return await web3.eth.getBlockNumber();
    }

    return blockNumberConfig;
}