const BlockRange = require("./block-range");

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
                msg.summary = null; // Clear previous summary (from another node)
                const contract = await smartContract.getContract();
                const options = {};

                const blockRange = await BlockRange.getBlockRangeConfig(config, msg, await smartContract.ethereumClient.getWeb3());
                options.fromBlock = blockRange.fromBlock;
                options.toBlock = blockRange.toBlock;

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

            function checkContractHasEvent(contract) {
                if (!contract.events[config.contractEvent]) {
                    throw Error(`The contract '${smartContract.name}' does not have an event '${config.contractEvent}'`);
                }
            }

            function triggerEventsPort(eventData, options) {
                msg.summary = { event: config.contractEvent, options: options, eventData: eventData }
                msg.payload = eventData;
                send(msg);
            }
        }
    }
}