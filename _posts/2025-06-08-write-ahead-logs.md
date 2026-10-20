---
layout: post
title: Understanding Write-Ahead Logs (WALs)
subtitle: The Foundation of Reliable Systems
gh-repo: jaybhanushali3166/me
gh-badge: [follow]
tags: [cloud]
comments: true
author: Jay Bhanushali
# tags: [cloud, case-study]
---

## What Is a Write-Ahead Log?

Modern distributed systems need to ensure **reliability**, **durability**, and **consistency** across crashes, delays, and replication. Whether you're working with databases like **PostgreSQL**, message brokers like **Kafka**, or document stores like **MongoDB**, there's one technique that underpins them all: the **Write-Ahead Log (WAL)**.

We will quickly see, why they're essential, and how they’re implemented across systems.

A **Write-Ahead Log (WAL)** is a sequential file where systems log every change before applying it to the actual data store. This approach ensures two things:

- **Durability**: If a crash occurs, changes in the log can be replayed.
- **Consistency**: Partial changes don’t corrupt the state; replaying the log restores the last consistent version.

In practice, every modification (insert/update/delete) is first appended to this log, which is stored on disk. Only after logging, the change is applied to the actual data structure.


## Why WALs Matter


### Durability

WALs ensure that once a system acknowledges a change, it won't be lost—even during crashes. Systems write changes sequentially, which is faster and more reliable than random disk writes.

### Crash Recovery

On restart, a system reads the WAL and reapplies incomplete operations to restore a consistent state. This enables fast recovery even from sudden power failures.

### Replication

Logs provide a linear, ordered view of changes, making them ideal for propagating data to replicas or consumers in real-time systems.

### Performance

Appending to a log is lightweight and efficient. Modern hardware handles sequential I/O better, and logs simplify recovery, state sync, and backups.


## WAL in Action: System-Specific Implementations


### PostgreSQL

PostgreSQL uses WALs to guarantee **ACID transactions**, **replication**, and **crash recovery**.

- **Log First**: Every transaction is written to a WAL segment file before modifying the database.
- **Apply Later**: Actual data files are updated asynchronously, during checkpoints.
- **Recovery**: On restart, PostgreSQL scans from the last checkpoint and reapplies WAL entries.

PostgreSQL supports two replication models:

- **Physical Replication**: Byte-for-byte WAL segment streaming.
- **Logical Replication**: Decodes WAL entries into SQL-like operations.

Archived WALs can support point-in-time recovery (PITR), backup, and disaster recovery.


### Kafka

Kafka takes WAL to the next level—it **is** a log system.

- **Topics and Partitions**: Each partition is an append-only WAL.
- **Offsets**: Each message gets a unique offset for ordering and replay.
- **Log Persistence**: Kafka flushes logs to disk before acknowledging writes.
- **Consumer Flexibility**: Consumers use offsets to track and replay messages.

Kafka's strength lies in its **horizontal scalability**:

- **Partitioning** enables parallelism.
- **Replication** ensures fault tolerance.
- **Leaders and Followers** manage write/read flow across brokers.


### MongoDB

MongoDB uses the **oplog** (operations log), a logical WAL, primarily for replication and crash recovery.

- **Log First**: Writes are logged as high-level JSON operations.
- **Apply Later**: Operations are applied asynchronously.
- **Replica Sync**: Secondaries read oplog entries and apply changes in order.

MongoDB’s **oplog is fixed-size** and works like a circular buffer. If a secondary node falls too far behind, it may miss older entries and need a full resync.


## Shared Principles Across All Systems

Despite differences in structure and application, PostgreSQL, Kafka, and MongoDB share core WAL traits:

1. **Append-Only**: Logs are immutable and sequential.
2. **Idempotency**: Operations can be replayed safely.
3. **Recovery Mechanism**: WALs act as a source of truth after crashes.
4. **Foundation for Replication**: Logs simplify keeping replicas up to date.
5. **Efficiency**: Sequential logging improves throughput and resilience.


## Real-World Scenarios

- **PostgreSQL**: ACID compliance and point-in-time recovery.
- **Kafka**: Streaming pipelines with high-throughput logs and message replays.
- **MongoDB**: Asynchronous replication for HA in distributed clusters.

All follow the principle: **log first, apply later**.


## Final Thoughts

WALs aren't just a database trick—they're the core of modern system design. If you're building systems that need to **scale**, **recover from failure**, or **replicate data** reliably, you're already depending on WALs.

Understanding how PostgreSQL, Kafka, and MongoDB implement them gives you a solid foundation for designing robust, fault-tolerant systems.
