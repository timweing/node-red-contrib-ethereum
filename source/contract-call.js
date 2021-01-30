const ContractCallBase = require("./contract-call-base");

module.exports = function(RED) {
    const contractCallBase = new ContractCallBase(RED, prepareArgs, isReadonlyCall)
    RED.nodes.registerType("contract-call", contractCallBase.createNode);

    function prepareArgs(config, msg, contract) {
        const functionAbi = contract.abi.filter(member => member.name === config.contractFunction && member.type === "function")[0];
        const expectedNumberOfArgs = functionAbi.inputs.length;
        if (expectedNumberOfArgs > 1) {
            return prepareMultipleArgs();
        }
        if (expectedNumberOfArgs === 1) {
            return prepareSingleArg();
        }
        return [];

        function prepareMultipleArgs() {
            if (msg.payload === null || msg.payload === undefined || !Array.isArray(msg.payload)) {
                throw Error(`Missing arguments. The contract function expects ${expectedNumberOfArgs} arguments. Check the ABI and provide them as an array in 'msg.payload'`);
            }
            const args = msg.payload.filter(element => (element !== null) && (element !== undefined));
            if (args.length !== expectedNumberOfArgs) {
                throw Error(`Mismatching number of arguments. The contract function expects ${expectedNumberOfArgs} arguments but ${args.length} were provided.`);
            }
            return args;
        }

        function prepareSingleArg() {
            if (msg.payload === null || msg.payload === undefined) {
                throw Error("Missing argument. The contract function expects 1 argument Check the ABI and provide a fitting value or object in 'msg.payload'");
            }
            return [msg.payload];
        }
    }

    function isReadonlyCall(config) {
        return config.readonlyFunction;
    }
}