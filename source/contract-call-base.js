module.exports = function(RED, prepareArgs, isReadonlyCall) {
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
                const args = prepareArgs(config, msg, contract);
                const contractCall = contract.methods[config.contractFunction].apply(null, args);
                const options = {};
                initializeSummary(args, options);

                let result;
                if (isReadonlyCall(config)) {
                    result = await contractCall.call(options);
                }
                else if (config.onlyEstimateGas) {
                    result = await onlyEstimateGas(contractCall, options);
                }
                else {
                    result = await sendTransaction(contractCall, options);
                }

                triggerResultPort(result);
                done();
            }
            catch(e) {
                if ("receipt" in e) {
                    triggerResultPort(e.receipt);
                }
                if ("reason" in e) {
                    node.error(e.reason); // Depends on ethereum client software whether this works or not.
                }
                node.error(e);
                done(e); // Passing error to done, so it can be handled by catch nodes.
            }

            function getSenderAccount() {
                let configNodeId;
                if (config.senderAccount) {
                    configNodeId = config.senderAccount;
                }
                else if (msg.hasOwnProperty("senderAccount")) {
                    // Find id the config node in global context. Config node stores it there at startup.
                    configNodeId = node.context().global.get(`SenderAccount${msg.senderAccount.replace(/ /g,'')}`);
                }
                else {
                    throw Error(`If no static configuration for 'senderAccount' is provided there must be a dynamic configuration on the input message 'msg.senderAccount'`);
                }

                const senderAccount = RED.nodes.getNode(configNodeId);
                if (senderAccount) {
                    return senderAccount;
                }
                throw Error(`Could not find configuration node for 'senderAccount'`);
            }

            async function onlyEstimateGas(contractCall, options) {
                options.from = getSenderAccount().address;
                return contractCall.estimateGas(options);
            }

            async function sendTransaction(contractCall, options) {
                const senderAccount = getSenderAccount();
                options.from = senderAccount.address;
                options.gas = await determineGasLimit();
                options.gasPrice = await determineGasPrice();
                return senderAccount.sendTransaction(contractCall, options, triggerTxHashPort);

                async function determineGasLimit() {
                    if (config.useEstimatedGasLimit) {
                        return await contractCall.estimateGas(options);
                    }
                    else if (config.gasLimit) {
                        return config.gasLimit;
                    }
                    else if (msg.hasOwnProperty("gasLimit")) {
                        return msg.gasLimit;
                    }
                    throw Error(`If no static configuration for 'gasLimit' is provided there must be a dynamic configuration on the input message 'msg.gasLimit'`);
                }

                async function determineGasPrice() {
                    if (config.usePreviousBlocksGasPrice) {
                        const web3 = await smartContract.ethereumClient.getWeb3();
                        return await web3.eth.getGasPrice();
                    }
                    else if (config.gasPrice) {
                        return config.gasPrice;
                    }
                    else if (msg.hasOwnProperty("gasPrice")) {
                        return msg.gasPrice;
                    }
                    throw Error(`If no static configuration for 'gasPrice' is provided there must be a dynamic configuration on the input message 'msg.gasPrice'`);
                }
            }

            function initializeSummary(args, options) {
                msg.summary = {
                    function: config.contractFunction,
                    args: args,
                    options: options
                };
            }

            function triggerTxHashPort(txHash) {
                msg.summary.txHash = txHash;
                msg.payload = txHash;
                send([msg, null]);
            }

            function triggerResultPort(result) {
                const resultJson = classInstanceToJson(result);
                msg.summary.result = resultJson;
                msg.payload = resultJson;
                send([null, msg]);
            }

            function classInstanceToJson(result) {
                // Object.assign(...) is because Node-RED debug node does not display class instances properly. Thus convert to a simple json object.
                return typeof result === "object" ? Object.assign({}, result) : result;
            }
        }
    }
}