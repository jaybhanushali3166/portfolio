---
layout: post
title: "Understanding Keys in Blockchain: A Simple Guide for Newbies"
subtitle: "Public keys, private keys, and wallets explained simply"
gh-repo: jaybhanushali3166/me
gh-badge: [star, fork, follow]
tags: [blockchain, ethereum, cryptography, wallet, web3]
comments: true
author: Jay Bhanushali
---

So, you’ve probably heard of “keys” in the context of blockchain. If you’re like me before I actually got into this space, you might have thought keys were just things that unlocked cool features or apps. Well, spoiler alert: they are, but not in the way you think! If you’re ready for some “light bulb moments” as we walk through the basics and subtle complexities of keys in the blockchain world, buckle up! We’ll do this step by step, keeping it simple!

---

### **The “Key” Idea**

First things first, **what is a key** in blockchain? And why do we need so many? If you’re wondering why you can’t just use the same key for everything like your regular password (you know, the one you set as ‘123456’ or ‘password123’), then you’re in for an interesting journey.

In the blockchain world, keys are not just regular old "keys" like you might think. These are **cryptographic keys**, and they’re a fundamental part of how blockchain works. These keys essentially allow you to interact with the blockchain. They’re like your digital ID card that proves you own certain assets (like Ethereum or Bitcoin) or can perform actions (like making a transaction).

There are mainly two types of keys:

- **Public Key** – The “Instagram handle” of your wallet. Public, shareable, safe.
- **Private Key** – The diary you hope no one ever reads. It’s secret. It proves ownership.

Now, manually managing a dozen private keys for each transaction or wallet sounds painful, right? We will solve this problem later in this article and for that things like mnemonics, master keys, and child keys come into play.

### **Mnemonic Phrases: Your Super-Secret Backup**

So, we’ve discussed keys, but how do you get these keys? How do you create a key from nothing? Well, that's where **mnemonic phrases** come in. Ever heard of a *seed phrase*? That’s basically a fancy way of saying **mnemonic phrase**.

To explain in simpler terms, a **mnemonic phrase** is a human-readable sequence of words that *generates* cryptographic keys. It's like a secret password you can remember, but much stronger and with way cooler security benefits. Instead of remembering a string of random characters (which would make your brain explode), you get a phrase that looks like this:

> “impact exit example acquire drastic cement usage float mesh source private bulb twenty guitar neglect”

  It’s a string of words that encodes all the information needed to generate your private keys. And that’s a lifesaver because, trust me, remembering a bunch of random letters and numbers isn’t fun. You must not lose it, so it is meant to be kept safe!

### **Master Key and Child Key: The Duo**

Now, here's where things get spicy. You may have heard the terms **master key** and** child key**. These are critical in blockchain because they allow us to derive multiple keys (like private keys) from a single starting point. Think of it like a family tree: you have your** master key** at the top, and you can derive** child keys** from it. These child keys are used for specific purposes, like signing transactions or withdrawing funds.

Let’s break it down:

- The **master key** is the root key, generated from your** mnemonic phrase**.
- **Entropy** is simply the source of randomness that converts your mnemonic phrase into a secure foundation for generating all your blockchain keys.
- Using the **master key**, you can derive** child keys** using a process called** Hierarchical Deterministic Key Generation (HDK)**. HDK is like a magical recipe where one key can create multiple sub-keys without you needing to remember each one individually. The system is designed to be** deterministic**, meaning if you use the same starting point (the mnemonic phrase), you’ll always get the same child keys.

![](https://cdn.hashnode.com/res/hashnode/image/upload/v1745268893351/dc627e03-d435-4e52-abb9-9958668db751.png)

But Why is this important? Consider below problem.

## Problem: Managing *many* keys securely is hard

Imagine you're an Ethereum 2.0 validator. You need:

- One key for signing duties
- Another for withdrawals
- You might have 100+ validators = 100+ key pairs!

That’s a mess to back up and store.

---

## Solution: **Hierarchical Deterministic (HD) Wallets**

HD wallets follow a simple principle:

> "Generate one **master key** (from a human-readable seed or mnemonic), and derive all other keys from it deterministically."

  This way:

- You only need to **back up one master key** (or the mnemonic phrase).
- You can **recreate all child keys** using that and a derivation path.

## **Which algorithm is used?**

The whole process follows a set of well-defined standards in crypto:

### 1. **BIP-39** — Mnemonic to Entropy

- Converts a mnemonic (like `"impact exit example acquire..."`) to a binary *entropy* value.
- This is just a fancy word for a big random number.

### 2. **BIP-32** — Master Key Derivation

- Uses HMAC-SHA512 to derive a **master private key + chain code**.
- From here, you can derive child keys — this is your **key tree**.

### 3. **EIP-2334** (for Ethereum 2.0 / BLS Keys)

- Defines a standard path structure like `m/12381/3600/0/0`
- This tells your wallet: "which branch/child key should I derive?"

### 4. **BLS Key Derivation** (used by `@chainsafe/bls-keygen`)

- After the master secret is derived, **Boneh–Lynn–Shacham (BLS)** cryptography is used to generate validator keys like:
  - **Signing key** (used to sign attestations/blocks)
  - **Withdrawal key** (used to withdraw ETH)

---

## Why does it always give the same key?

Because the whole flow is **deterministic**:

```text
Mnemonic
  ↓ BIP-39
Entropy
  ↓ BIP-32
Master Key
  ↓ BLS + Path
Child Key
```

As long as you use:

- the **same mnemonic**
- the **same derivation path**
- the **same algorithms**

You’ll always get the **same key output**.

### Conclusion

So, Whether you're just venturing into the blockchain space or trying to finally understand what all those keys in your wallet do, remember this — **your mnemonic is your master passport**, and from it, a whole world of cryptographic identity is born.
