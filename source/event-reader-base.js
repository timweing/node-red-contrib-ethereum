module.exports = function(RED, getFilter) {
    this.createNode = CreateNode;

    function CreateNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const smartContract = RED.nodes.getNode(config.smartContract);

        // Don't start processing messages until config nodes are ready.
        smartContract.getContract()
            .then(contract => node.on("input", handleInputMessage))
            .catch(e => node.error(e));

        async function handleInputMessage(msg, send, done) {
            try {
                const contract = await smartContract.getContract();
                const options = {};

                options.toBlock = getBlockNumberOption("toBlock");
                validateToBlock(options.toBlock);
                options.fromBlock = await resolveFromBlock(getBlockNumberOption("fromBlock"), options.toBlock);

                let filter = getFilter(config, msg, node);
                if (filter) {
                    options.filter = filter;
                }

                checkContractHasEvent(contract);
                const eventData = await contract.getPastEvents(config.contractEvent, options);
                triggerEventsPort(eventData, options);
                done();
            } catch (e) {
                node.error(e);
                done(e); // Passing error to done, so it can be handled by catch nodes.
            }

            function triggerEventsPort(eventData, options) {
                msg.summary = { event: config.contractEvent, options: options, eventData: eventData }
                msg.payload = eventData;
                send(msg);
            }

            function getBlockNumberOption(optionName) {
                let raw;
                if (config[optionName]) {
                    raw = config[optionName];
                }
                else if (msg.hasOwnProperty(optionName)) {
                    raw = msg[optionName];
                }
                else {
                    throw Error(`If no static configuration for '${optionName}' is provided there must be a dynamic configuration on the input message 'msg.${optionName}'`);
                }

                return parseBlockNumber(raw);

                function parseBlockNumber(raw) {
                    if (raw === "latest") {
                        return raw;
                    }
                    else {
                        const parsed = parseInt(raw);
                        if (isNaN(parsed)) {
                            throw Error(`Invalid block number '${raw}' for option '${optionName}'`);
                        }
                        return parsed;
                    }
                }
            }

            function validateToBlock(toBlock) {
                if (toBlock !== "latest" && toBlock < 0) {
                    throw Error(`Invalid block number '${toBlock}' for 'toBlock'`);
                }
            }

            async function resolveFromBlock(fromBlockParsed, toBlockParsed) {
                if (fromBlockParsed < 0) {
                    // If 'fromBlockParsed' is negative it means to get the events from the last few blocks.
                    // Example: fromBlockParsed = -10 && toBlockParsed = 'latest' then we want the events from block 'latest' - 10 up to 'latest'.

                    if (toBlockParsed !== "latest") {
                        return toBlockParsed + fromBlockParsed;
                    }
                    const web3 = await smartContract.ethereumClient.getWeb3();
                    const latest = await web3.eth.getBlockNumber();
                    return latest + fromBlockParsed;
                }
                return fromBlockParsed;
            }

            function checkContractHasEvent(contract) {
                if (!contract.events[config.contractEvent]) {
                    throw Error(`The contract '${smartContract.name}' does not have an event '${config.contractEvent}'`);
                }
            }
        }
    }
}