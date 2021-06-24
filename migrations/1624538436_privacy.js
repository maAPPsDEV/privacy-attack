const Privacy = artifacts.require("Privacy");

module.exports = function (_deployer) {
  // Use deployer to state migration tasks.
  const data = Array.from({ length: 3 }, () => web3.utils.randomHex(32));
  console.log("data", data);
  _deployer.deploy(Privacy, data);
};
