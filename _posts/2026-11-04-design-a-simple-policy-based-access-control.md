---
layout: post
title: "Designing Simple Policy-Based Access Control"
subtitle: "A small LLD for deciding who can access an S3 object"
tags: [pbac, iam, s3, low-level-design, authorization]
comments: true
author: Jay Bhanushali
---

Imagine that Alice asks our storage service to read `reports/public/a.txt`. How does the service decide whether to say yes?

We will design a small **policy-based access control (PBAC)** system to answer that question. We will start with the data, identify the classes and methods, and then put them together in pseudocode. No particular programming language is required.

## The problem

Our authorization service receives a request containing:

- **Who:** a principal, such as Alice.
- **What:** an action, such as `s3:GetObject`.
- **Which resource:** a bucket or object, such as `reports/public/a.txt`.
- **Context:** request facts, such as whether the connection uses HTTPS.

It returns **Allow** or **Deny**, with a reason. We assume another part of the system has already checked Alice's credentials and given us a trustworthy principal.

For this simple version, permissions come from two places: a policy attached to the caller and a policy attached to the bucket. A policy is a list of statements. Each statement says **Allow** or **Deny** for a particular action and resource. A bucket-policy statement can also name the principal it applies to.

There are three rules to remember:

1. A matching **explicit Deny** wins, even if another statement says Allow.
2. If the required Allow is missing, the request is **implicitly denied**.
3. For a bucket in the caller's account, either the identity policy or bucket policy can allow access. Across accounts, both must allow access.

## Core entities

An **account** is a tenant. Account `111` owns the `reports` bucket. Alice belongs to account `111`; Bob belongs to account `222`. Alice's request is *same-account*, while Bob's request to `reports` is *cross-account*.

```text
Account
  id
  name

Principal
  id
  accountId

Bucket
  name
  ownerAccountId

AuthorizationRequest
  principal
  action
  resource
  bucketName
  context (for example, secureTransport)

Policy
  statements[]

Statement
  effect          // ALLOW or DENY
  actionPattern   // for example, s3:GetObject
  resourcePattern // for example, reports/public/*
  principal       // optional; used in bucket policies
  condition       // optional; for example, secureTransport = false
```

Notice that `Account` and `Principal` answer different questions. The account tells us **which tenant** owns an identity or bucket. The principal tells us **who is making this request**.

## Classes and methods

We need one class to fetch data, one to evaluate a policy, and one to make the final decision.

```text
PolicyRepository
  getIdentityPolicy(principal) -> Policy
  getBucketPolicy(bucketName) -> Policy

BucketRepository
  getBucket(bucketName) -> Bucket

PolicyEvaluator
  evaluate(policy, request, isBucketPolicy) -> ALLOW | DENY | NO_MATCH
  statementMatches(statement, request, isBucketPolicy) -> true | false

AuthorizationService
  authorize(request) -> Decision
```

`PolicyEvaluator` looks at **one policy**. `AuthorizationService` combines its results. This keeps the matching rules separate from the same-account and cross-account rules.

## Step 1: Evaluate one policy

A statement matches only when its action, resource, principal when needed, and condition all match the request.

```text
function statementMatches(statement, request, isBucketPolicy):
    if isBucketPolicy and statement.principal does not match request.principal:
        return false

    if statement.actionPattern does not match request.action:
        return false

    if statement.resourcePattern does not match request.resource:
        return false

    if statement.condition does not match request.context:
        return false

    return true
```

For our example, `reports/public/*` means any object whose resource starts with `reports/public/`. A missing condition means there is no extra restriction.

Now we can evaluate the whole policy:

```text
function evaluate(policy, request, isBucketPolicy):
    foundAllow = false

    for each statement in policy.statements:
        if not statementMatches(statement, request, isBucketPolicy):
            continue

        if statement.effect == DENY:
            return DENY

        if statement.effect == ALLOW:
            foundAllow = true

    if foundAllow:
        return ALLOW

    return NO_MATCH
```

`NO_MATCH` is important: it means this policy did not grant the request. It is different from a statement that explicitly says `DENY`.

## Step 2: Combine the policies

First, load the bucket and both policies. Then apply deny precedence and the account rule.

```text
function authorize(request):
    bucket = bucketRepository.getBucket(request.bucketName)
    identityPolicy = policyRepository.getIdentityPolicy(request.principal)
    bucketPolicy = policyRepository.getBucketPolicy(bucket.name)

    identityResult = evaluator.evaluate(identityPolicy, request, false)
    bucketResult = evaluator.evaluate(bucketPolicy, request, true)

    if identityResult == DENY or bucketResult == DENY:
        return Decision(DENY, "explicit deny")

    sameAccount = request.principal.accountId == bucket.ownerAccountId

    if sameAccount:
        if identityResult == ALLOW or bucketResult == ALLOW:
            return Decision(ALLOW, "same-account allow")
    else:
        if identityResult == ALLOW and bucketResult == ALLOW:
            return Decision(ALLOW, "cross-account allow")

    return Decision(DENY, "implicit deny")
```

That is the entire decision engine for our small design!

## Let's try some requests

Give Alice an identity-policy statement allowing `s3:GetObject` on `reports/*`. Give the bucket two statements: deny object reads over HTTP, and allow Bob to read `reports/public/*`. Bob's own identity policy also allows him to read `reports/public/*`.

| Request | Identity result | Bucket result | Final result |
| --- | --- | --- | --- |
| Alice reads `public/a.txt` over HTTPS | Allow | No match | **Allow**: same account |
| Alice reads `public/a.txt` over HTTP | Allow | Deny | **Deny**: explicit deny |
| Alice uploads `public/a.txt` | No match | No match | **Deny**: implicit deny |
| Bob reads `public/a.txt` over HTTPS | Allow | Allow | **Allow**: cross-account |
| Bob reads `other/a.txt` over HTTPS | No match | No match | **Deny**: implicit deny |

The HTTP row illustrates *explicit deny*: the bucket policy actively blocks that request. The upload row illustrates *implicit deny*: nobody granted `s3:PutObject`.
