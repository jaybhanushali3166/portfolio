---
layout: post
title: "What is Blockchain? And What's in it for You?"
subtitle: "A beginner-friendly introduction to blockchain"
gh-repo: jaybhanushali3166/me
gh-badge: [star, fork, follow]
tags: [blockchain, javascript, cryptocurrency, cryptography]
comments: true
author: Jay Bhanushali
---

> Blockchain is the biggest opportunity set we can think of over the next decade or so. - Bob Greifeld, Nasdaq Chief Executive

  I am sure you might have heard about it or have some knowledge about it by now, if not then well, now you have heard about it. In this article, I aim to explain to you what is blockchain and why you should know about it.

In order to understand something, it's important to know the history. So once upon a time...ahhhhh! No, let's not deep dive into it now. Below is the list of milestones (or checkpoints) to note the rise of blockchain.

### 1991

- A cryptographically secured chain of blocks is described for the first time by Stuart Haber and W Scott Stornetta

### 1998

- Computer scientist Nick Szabo works on ‘bit gold’, a decentralized digital currency

### 2000

- Stefan Konst publishes his theory of cryptographically secured chains, plus ideas for implementation

### 2008

- Developer(s) working under the pseudonym Satoshi Nakamoto released a white paper establishing the model for a blockchain

### 2009

- Nakamoto implements the first blockchain as the public ledger for transactions made using bitcoin

### 2014

- Blockchain 2.0 is born, referring to applications beyond currency. The Ethereum blockchain system introduced

### 2016

- IBM announces a blockchain strategy for cloud-based solutions. Countries recognizing the legitimacy of blockchain and cryptocurrency

### 2020

- Facebook commits to start a blockchain group. Bitcoin almost reaches $30,000 and continues to grow

### What exactly is Blockchain?

Blockchain in simple terms can be understood as a chain of blocks that can carry certain information. Depending on the use case and application, the information can vary. A single block consists of three entities:

1. Transaction **data** (Information)
2. **Nonce** - A 32-bit whole number that generates a unique **Hash** for a block
3. Reference of previous block's hash

To create a block, one needs to solve the complex math problem of finding the nonce that can generate the acceptable hash, which is not so easy. Once the accepted hash is generated after a lot of computations and efforts, the data is signed in the block and it gets connected to the chain. The person which does this is called as **miner**. In order to make a change in a block, it not only requires to re-mine one block but also all the previous blocks which are linked to it, and hence it's nearly impossible to manipulate blockchain technology.

### Nodes

Once a block is mined, it is then verified by the nodes in the network. Nodes are nothing but the pools of blocks. So as the system is **de-centralized**, every node has its own copy of the blockchain and no one system would have control over it instead, there is a** Distributed Ledger** that logs all the actions happening between the blocks which thereby makes the system transparent. The diagram below can help us in understanding this with an example

![images (1).png](https://cdn.hashnode.com/res/hashnode/image/upload/v1621802006159/ZvBmrVvVw.png)

*Credit: ledger.com*

### Idealogy

The core reasons this technology and underlying applications are being recognized are:

1. Promising more **Secure** and scalable systems which are revolutionizing the IT industry.
2. **Decentralized Approach** - There will be no control of central authority over the system, instead it will be managed/validated by every node in the network.
3. Ample of **use cases** and projects with the basic principle of blockchain in its core, a few of which are Cryptocurrencies, Smart contracts, Safer transactions, and NFT Marketplaces.
4. **Open Source** - Almost all the prominent projects are available to the public and they can contribute to the same.

### Impact on Developers community

> Anything that can conceive of as a supply chain, blockchain can vastly improve its efficiency- it doesn’t matter if it's people, numbers, data, money. - Ginni Rometty, CEO IBM

  This rise and Significant features are encouraging developers and engineers to experiment and create systems on the blockchain. The impact is huge as it has a lot more potential than just cryptocurrencies.

![PicsArt_05-13-02.54.29.jpg](https://cdn.hashnode.com/res/hashnode/image/upload/v1621717854488/zCcVKX4LI6.jpeg)

*source: LinkedIn (2020)*

I hope we now have basic knowledge of blockchain but it would be more clear if we could see all of this in working right? Let's not worry, cause I have it covered😎

### A Simple Blockchain Using JavaScript

We can start small and try to understand and build a simple blockchain. Check out how I made a blockchain with JavaScript [here](/2021-05-24-creating-a-simple-blockchain-using-javascript/).

I would be happy to read your thoughts on this and if you have any feedback /references, you can mention them in the comments belove. Thank you so much for your time. 🙂
