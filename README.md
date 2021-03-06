# Solidity Game - Privacy Attack

_Inspired by OpenZeppelin's [Ethernaut](https://ethernaut.openzeppelin.com), Privacy Level_

⚠️Do not try on mainnet!

## Task

The creator of this contract was careful enough to protect the sensitive areas of its storage.
Unlock this contract.

_Hint:_

1. Understanding how storage works
2. Understanding how parameter parsing works
3. Understanding how casting works

## What will you learn?

1. [Layout of State Variables in Storage](https://docs.soliditylang.org/en/v0.8.5/internals/layout_in_storage.html)

   > State variables of contracts are stored in storage in a compact way such that multiple values sometimes use the same storage slot.
   > For each variable, a size in bytes is determined according to its type. Multiple, contiguous items that need less than 32 bytes are packed into a single storage slot if possible.

![storage1](https://user-images.githubusercontent.com/78368735/123262979-dcf00100-d4ce-11eb-8696-f71659ab509f.jpeg)

2. [Mappings and Dynamic Arrays](https://docs.soliditylang.org/en/v0.8.5/internals/layout_in_storage.html#mappings-and-dynamic-arrays)

   > Due to their unpredictable size, mappings and dynamically-sized array types cannot be stored “in between” the state variables preceding and following them. Instead, they are considered to occupy only 32 bytes with regards to the rules above and the elements they contain are stored starting at a different storage slot that is computed using a Keccak-256 hash.
   > In the sense that there is a slot for the array itself and a data area that is computed using a `keccak256` hash of that slot’s position.

## What is the most difficult challenge?

### How Ethereum optimizes data storage 🤔

From Solidity [docs](https://docs.soliditylang.org/en/v0.8.5/internals/layout_in_storage.html#layout-of-state-variables-in-storage), we get this definition:

> Except for dynamically-sized arrays and mappings, data is stored contiguously item after item starting with the first state variable, which is stored in slot `0`.
> Multiple, contiguous items that need less than 32 bytes are packed into a single storage slot if possible.

#### Less Efficient Storage Use

Here’s an example of inefficient storage usage. Notice that smaller size variables like `boolVar` and `bytes4Var` are not sequentially initialized, taking new slots 0 and 2 when they could have been packed together:
![storage2](https://user-images.githubusercontent.com/78368735/123262993-e1b4b500-d4ce-11eb-889c-206d14f1baf9.jpeg)

#### More Efficient Storage Use

A more efficient storage method would be to sequentially declare the `bool` (1 byte size) and the `bytes4` (4 bytes size) variables. The EVM then efficiently packs the two into a single storage slot.
Likewise, in the `Object` `struct`, the more efficient method is to pack the two `uint8`s together, taking up 1 slot. This way, all future instances of Object only take 2 slots to store, rather than 3. Storage optimization is especially important in structs, as the storage can grow rapidly:
![storage3](https://user-images.githubusercontent.com/78368735/123263231-1fb1d900-d4cf-11eb-9bd3-3342dfdfb39d.jpeg)

**Notice:** slots index at 0 from RIGHT to LEFT. `bytes4Var` is initialized after `boolVar`, so its stored to the left of `boolVar`, exactly 1 byte from the right.

**Exceptions:**

1. `constants` are not stored in storage. From Solidity [documentation](https://docs.soliditylang.org/en/v0.8.5/contracts.html), that the compiler does not reserve a storage slot for `constant` variables. This means you won’t find the following in any storage slots:

```
contract A {
    uint public constant number = ...; //not stored in storage
}
```

2. Mappings and dynamically-sized arrays do not stick to these conventions.

### Security Considerations

- In general, excessive slot usage wastes gas, especially if you declared structs that will reproduce many instances. **Remember to optimize your storage to save gas!**
- Save your variables to `memory` if you don’t need to persist smart contract state. `SSTORE` & `SLOAD` are very gas intensive opcodes.
- All storage is publicly visible on the blockchain, even your `private` variables!
- Never store passwords and private keys without hashing them first.

## Source Code

⚠️This contract contains a bug or risk. Do not use on mainnet!

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

contract Privacy {
  bool public locked = true;
  uint256 public ID = block.timestamp;
  uint8 private flattening = 10;
  uint8 private denomination = 255;
  uint16 private awkwardness = uint16(block.timestamp);
  bytes32[3] private data;

  constructor(bytes32[3] memory _data) public {
    data = _data;
  }

  function unlock(bytes16 _key) public {
    require(_key == bytes16(data[2]));
    locked = false;
  }

  /*
    A bunch of super advanced solidity algorithms...

      ,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`
      .,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,
      *.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^         ,---/V\
      `*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.    ~|__(o.o)
      ^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'^`*.,*'  UU  UU
  */
}

```

## Configuration

### Install Truffle cli

_Skip if you have already installed._

```
npm install -g truffle
```

### Install Dependencies

```
yarn install
```

## Test and Attack!💥

### Run Tests

```
truffle develop
test
```

You should unlock contract successfully.

```
truffle(develop)> test
Using network 'develop'.


Compiling your contracts...
===========================
> Everything is up to date, there is nothing to compile.



data [
  '0xcc8db7b17346a0c3e6cba83affe8a88a9f86455f9f9619d2f59c271a9b3a8f60',
  '0xb5319411b04e31d05369dc5ff929a09dbe4e49aace036d6f5ad79dec33f681f4',
  '0x6cb79e2ea29b85193ccb73ca2d1939bcfcc2259e3745c0099d5662958209ca4f'
]


  Contract: Hacker
data2 0x6cb79e2ea29b85193ccb73ca2d1939bcfcc2259e3745c0099d5662958209ca4f
key 0x6cb79e2ea29b85193ccb73ca2d1939bc 34
    √ should unlock contract (362ms)


  1 passing (434ms)

```
