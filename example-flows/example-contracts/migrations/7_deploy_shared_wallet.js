const SharedWallet = artifacts.require("SharedWallet");

module.exports = function (deployer) {
    deployer.deploy(
        SharedWallet,
        [
            "0x89a47029b7168a240BD49bd446F79cee6cad11D4", // Account 1
            "0x037bB274D93f4Db069AC961d653a807E4E7c5A48", // Account 2
            "0xd16E92811948E986ee26c7759f7DA53BAa8DD980" // Account 3
        ]);
}
