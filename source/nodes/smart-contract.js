module.exports = function(RED) {
    RED.nodes.registerType("smart-contract", SmartContract);

    function SmartContract(config) {
        RED.nodes.createNode(this, config);
        const node = this;

        node.name = config.name;
        node.ethereumClient = RED.nodes.getNode(config.ethereumClient);

        let contractInstance = undefined;
        const contractPromises = [];

        // Gets the contract instance stored in this config node.
        node.getContract = async function() {
            return new Promise((resolve, reject) => {
                if (contractInstance) {
                    resolve(contractInstance);
                }
                else {
                    contractPromises.unshift({ resolve: resolve, reject: reject });
                }
            })
        }

        node.ethereumClient.getWeb3()
            .then(initialize)
            .catch(e => {
                node.error(e);
                while (contractPromises.length > 0) {
                    contractPromises.pop().reject(e);
                }
            });

        async function initialize(web3) {
            try {
                const abi = JSON.parse(config.abi);
                const contract = new web3.eth.Contract(abi, config.address);
                contract.abi = abi;
                await checkSmartContractExists();
                contractInstance = contract;
                while (contractPromises.length > 0) {
                    contractPromises.pop().resolve(contractInstance);
                }

                async function checkSmartContractExists() {
                    const contractByteCode = await web3.eth.getCode(config.address)
                    if (contractByteCode === '0x' || contractByteCode === '0x0') {
                        throw new Error(`Contract '${config.name}' not found on ethereum client '${node.ethereumClient.name}'. Did you enter the correct contract address? '${config.address}'`);
                    }
                    node.log(`Contract '${config.name}' found on ethereum client '${node.ethereumClient.name}'`);
                }
            }
            catch (e) {
                node.error(e);
                const parseAbiError = new Error(`Initializing contract instance failed`);
                node.error(parseAbiError);
                while (contractPromises.length > 0) {
                    contractPromises.pop().reject(parseAbiError);
                }
            }
        }
    }
}