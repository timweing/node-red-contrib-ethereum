const RecordsCrud = artifacts.require("RecordsCrud");

module.exports = function (deployer) {
    deployer.deploy(RecordsCrud)
}
