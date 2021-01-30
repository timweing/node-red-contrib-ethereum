const YodaToken = artifacts.require("YodaToken");
const CoinPriceOracle = artifacts.require("CoinPriceOracle");

module.exports = function (deployer) {
    deployer.deploy(YodaToken).then(function() {
        return deployer.deploy(CoinPriceOracle, YodaToken.address);
    });
}
