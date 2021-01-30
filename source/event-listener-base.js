module.exports = function(RED, getFilter) {
    this.createNode = CreateNode;

    function CreateNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        const smartContract = RED.nodes.getNode(config.smartContract);

        let filter;
        try {
            filter = getFilter(config, node);
            smartContract.getContract()
                .then(listenForEvents)
                .catch(e => node.error(e));
        }
        catch(e) {
            node.error(e);
        }

        function listenForEvents(contract) {
            try {
                const options = filter ? { filter: filter } : {};
                const subscription = contract.events[config.contractEvent](options);

                subscription.on("connected", subscriptionId => {
                    node.log(`Connected event subscription '${subscriptionId}' for '${smartContract.name} : ${config.contractEvent}'`);
                }).on("data", eventData => {
                    node.log(`Received event '${smartContract.name} : ${eventData.event}'.`);
                    triggerEventPort(eventData, options);
                }).on("error", (e, receipt) => {
                    node.error(e);
                    node.log(receipt);
                });

                node.on("close", (removed, done) => {
                    subscription.unsubscribe((e, success) => {
                        if (success) {
                            node.log(`Unsubscribed event '${smartContract.name} : ${config.contractEvent}'.`);
                        }
                        else {
                            node.log(`Unsubscribing event '${smartContract.name} : ${config.contractEvent}' not successful.`);
                        }
                        done();
                    })
                });
            }
            catch (e) {
                node.error(e);
            }

            function triggerEventPort(eventData, options) {
                const msg = { summary: { event: config.contractEvent, options: options, eventData: eventData } };
                msg.payload = eventData;
                node.send(msg);
            }
        }
    }
}