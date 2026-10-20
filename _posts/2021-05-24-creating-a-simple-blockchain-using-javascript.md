---
layout: post
title: "Creating A Simple BlockChain using JavaScript"
subtitle: "Build your own crypto coin from scratch in JavaScript"
gh-repo: jaybhanushali3166/me
gh-badge: [star, fork, follow]
tags: [blockchain, javascript, cryptocurrency, ethereum, cryptography]
comments: true
author: Jay Bhanushali
---

In this article, I am going to demonstrate how to create a Simple Blockchain using JavaScript. So hang in there and watch me create my own Crypto Coin and I am excited already !!!!

So let's start with creating a block with basic entities in it, and those are :

- **index** (optional) - where exactly the block lies in the blockchain
- **timestamp** - time at which block was created
- **data** - Information that needs to be passed
- **hash** - A unique identifier of the block
- **previousHash** - hash of previous block that is connected

```javascript
const SH256 = require("crypto-js/sha256");

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.previousHash = previousHash;
        this.hash = '';
    }
    createHash() {
        return SH256(this.index + this.timestamp
            + JSON.stringify(this.data)).toString()
    }
}
```

Here, I am using SH256 hash function from library [crypto-js](https://www.npmjs.com/package/crypto-js)

With this, we can now create a block and can link it to a chain.

```javascript
class BlockChain {
    constructor() {
        this.blockchain = [this.startGenesisBlock()]
    }
    startGenesisBlock() {
        return new Block(0, "01/01/2020", "Initial Block in the Chain", "0");
    }
    getLatestBlock() {
        return this.blockchain[this.blockchain.length - 1];
    }
    addNewBlock(newBlock) {
        newBlock.precedingHash = this.getLatestBlock().hash;
        newBlock.hash = newBlock.createHash();
        this.blockchain.push(newBlock);
    }
}
```

Above I have created another class BlockChain that represents our blockchain as a whole.

- **startGenesisBlock** - Genesis Block is the initial block in a chain. It uses the same Block class which we created earlier
- **getLatestBlock** - To get the Latest block
- **addNewBlock** - To add a new block. **precedingHash** of the block is updated with the hash of the latest block and a new hash is also created after which it gets added into the chain

That's it! We have our blockchain in place and now let's just create our coin, straight away!

```javascript
let JBCoin = new BlockChain();
JBCoin.addNewBlock(new Block(1, "25/05/2021", { sender: "Jay Bhanushali", recipient: "Elon Musk", quantity: 20 }));
JBCoin.addNewBlock(new Block(1, "26/05/2021", { sender: "Elon Musk", recipient: "Jay Bhanushali", quantity: 100 }));
console.log(JSON.stringify(JBCoin, null, 4))
```

And I am clearly +80, already !! xD

Wow !! That was simple, but these systems in the real world are more complex with multiple checks and authentication revolving around it. Nonetheless, this is the basic architecture that is followed in creating the systems.

In the next article, we will be seeing how we can add Validation and Proof-of-Work in this Blockchain. You can find the code snippet [here](https://github.com/jaybhanushali3166/JB-Coin)

Do Let me know your thoughts on this in the comments below. Thank you so much for your time. 😊
