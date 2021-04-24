const ContractCallBase = require("./contract-call-base");

module.exports = function(RED) {
    const contractCallBase = new ContractCallBase(RED, prepareArgs, isReadonlyCall)
    RED.nodes.registerType("erc20-call", contractCallBase.createNode);

    const functionProperties = {
        totalSupply: { isReadonly: true, requiredInputs: [] },
        balanceOf: { isReadonly: true, requiredInputs: ["fromAddress"] },
        transfer: { isReadonly: false, requiredInputs: ["toAddress", "tokenAmount"] },
        allowance: { isReadonly: true, requiredInputs: ["fromAddress", "toAddress"] },
        approve: { isReadonly: false, requiredInputs: ["toAddress", "tokenAmount"] },
        transferFrom: { isReadonly: false, requiredInputs: ["fromAddress", "toAddress", "tokenAmount"] }
    };

    function prepareArgs(config, msg, contract) {
        return getArgs(functionProperties[config.contractFunction].requiredInputs);

        function getArgs(requiredInputs) {
            const args = [];
            requiredInputs.forEach(inputName => {
                args.push(getArg(inputName));
            });
            return args;
        }

        function getArg(inputName) {
            if (config[inputName]) {
                return config[inputName];
            }
            else if (msg.hasOwnProperty(inputName)){
                return msg[inputName];
            }
            else {
                throw Error(`If no static configuration for '${inputName}' is provided there must be a dynamic configuration on the input message 'msg.${inputName}'`);
            }
        }
    }

    function isReadonlyCall(config) {
        return functionProperties[config.contractFunction].isReadonly;
    }
}