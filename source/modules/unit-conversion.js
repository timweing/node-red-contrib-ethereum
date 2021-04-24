module.exports = {
    convertFromTo
}

const Web3 = require("web3");

function convertFromTo(input, fromUnit, toUnit) {
    const web3 = new Web3();
    const wei = web3.utils.toWei(web3.utils.toBN(input), fromUnit);
    return web3.utils.fromWei(wei, toUnit).toString();
}