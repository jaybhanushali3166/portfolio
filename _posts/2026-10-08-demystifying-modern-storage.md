---
layout: post
title: "Demystifying Modern Storage: From Linux Inodes to S3 and MinIO Distributed Architecture"
subtitle: "Understanding POSIX File Systems, Object Storage, Multipart Uploads, and Distributed Quorum"
gh-repo: jaybhanushali3166/me
gh-badge: [star, fork, follow]
tags: [storage, system-design, distributed-systems, linux, s3]
comments: true
author: Jay Bhanushali
mathjax: true
---

## 1. Traditional File Systems Under the Hood (POSIX)

Before exploring distributed systems or object storage, we must understand what happens on a local drive when an operating system saves or modifies a file.

### Data Blocks vs. Inodes

A local filesystem (such as `ext4` or `XFS`) splits every storage device into two fundamental spaces:

1. **Data Blocks 💾:** Fixed-size chunks of raw physical storage (typically **4 KB** or 4,096 bytes each). These hold the actual byte stream of your file—the text, pixels, or binary data.
2. **Inodes (Index Nodes) 📑:** Small, fixed-size data structures that act as the identity card and routing table for a file. Every file has exactly one inode identified by a unique **inode number**.

An inode stores metadata about the file:
* File size
* Permissions (owner, group, read/write/execute flags)
* Timestamps (created, modified, accessed)
* **Direct & Indirect Block Pointers:** The array of physical disk sector addresses where the file's 4 KB data blocks live.

```
       Directory Table
  ┌────────────┬─────────────┐
  │ File Name  │ Inode Num   │
  ├────────────┼─────────────┤
  │ notes.txt  │ 10425       │──────┐
  └────────────┴─────────────┘      │
                                    ▼
                              Inode #10425
                       ┌─────────────────────────┐
                       │ Size: 8192 bytes        │
                       │ Permissions: rw-r--r--  │
                       │ Block Pointer 0: Sector 400 ──► [ 4 KB Data Block ]
                       │ Block Pointer 1: Sector 802 ──► [ 4 KB Data Block ]
                       └─────────────────────────┘
```

> **Key Takeaway:** The inode **does not** contain the file name. The file name exists exclusively inside a directory table mapping strings to inode numbers.

---

### What Actually Happens During a File Rename?

When you rename a file from `notes.txt` to `draft.txt` via `mv notes.txt draft.txt`:

* **Data Blocks:** Zero data blocks are read, moved, or updated.
* **Inode:** The inode number and its internal block pointers remain untouched.
* **Directory Table:** Only the directory table entry changes its string label:

```
Before: "notes.txt" ──► Inode 10425
After:  "draft.txt" ──► Inode 10425
```

Because of this separation, renaming a 100 GB file takes less than a millisecond.

---

### In-Place Mutation: The 4 KB Reality

Traditional file systems allow applications to open a file descriptor, seek to an arbitrary byte offset, and rewrite specific bytes in place:

1. **Random Access via `lseek()`:** A file descriptor tracks an internal read/write offset (e.g., byte index 5,000).
2. **Offset-to-Block Translation:**
   $$\text{Target Block Index} = \lfloor 5000 / 4096 \rfloor = 1$$
   $$\text{Offset within Block} = 5000 \pmod{4096} = 904$$
3. **The Read-Modify-Write Cycle:** Disks and SSD controllers cannot physically rewrite an isolated single byte. The OS loads the entire 4 KB block containing that byte into the kernel **page cache (RAM)**, mutates byte 904 in memory, marks the page as dirty, and later flushes the entire **4,096 bytes** back to storage.

---

### Scaling Bottlenecks of Traditional File Systems

1. **Inode Exhaustion:** A file system is formatted with a finite pool of inodes. Creating millions of tiny 1 KB files can exhaust all inodes, triggering a `Disk Full` error even if hundreds of gigabytes of disk capacity remain free.
2. **Directory Traversal Contention:** Resolving `/tenant-A/reports/2026/january/summary.pdf` requires locking and traversing each directory layer sequentially. Directories containing millions of entries experience extreme lock contention and search degradation.
3. **Distributed Mutation Complexity:** Coordinating random 4 KB block overwrites across a network across multiple replica servers requires distributed lock managers, making multi-node horizontal scaling brittle and complex.

---

## 2. Object Storage: A Paradigm Shift

Object storage drops inodes, hierarchical directory trees, and in-place byte mutations entirely, replacing them with a flat key-value store.

```
┌──────────────────────────────────────────────────────────────┐
│ Bucket: "customer-data" (Flat Namespace)                     │
├──────────────────────────────────┬───────────────────────────┤
│ Key (String Identifier)          │ Value (Immutable Payload) │
├──────────────────────────────────┼───────────────────────────┤
│ "reports/2026/jan/summary.pdf"   │ [Binary Stream / Blob]    │
│ "backups/db.tar.gz"              │ [Binary Stream / Blob]    │
└──────────────────────────────────┴───────────────────────────┘
```

* **Buckets:** Top-level containers acting as namespaces.
* **Object Keys:** Raw string identifiers. Slashes (`/`) do not represent true folders on a disk; they are merely characters in a string.
* **Payload:** The raw, unformatted byte stream.
* **User Metadata:** Key-value attributes attached permanently to the object headers (`x-amz-meta-*`).

### Immutability

Objects in object storage are **strictly immutable**:
* **No In-Place Edits:** You cannot update 1 byte inside a 10 GB object. Updating requires re-uploading the entire 10 GB payload.
* **No Direct Renames:** A "rename" requires issuing an atomic `CopyObject` to the target key followed by a `DeleteObject` on the source key.

---

## 3. The Standard S3 REST API

The Amazon S3 API maps storage operations directly to standard HTTP verbs:

| S3 Operation | HTTP Verb | Mechanism |
| :--- | :--- | :--- |
| **`GET`** | `GET /bucket/key` | Streams the entire payload body along with metadata headers (`ETag`, `Content-Type`). |
| **`PUT`** | `PUT /bucket/key` | Uploads an entire object atomically. If the key exists, it is overwritten. |
| **`DELETE`** | `DELETE /bucket/key` | Removes the object key record. Responds with `204 No Content`. |
| **`HEAD`** | `HEAD /bucket/key` | Retrieves only object metadata and headers without streaming the payload body. |

---

### S3 Multipart Upload

Uploading huge files (100 MB to 5 TB) over a single HTTP `PUT` connection is brittle: a brief network drop forces the client to restart from byte 0. 

Multipart Upload solves this by decoupling the upload process into three distinct phases:

```
Client                                                 S3 / MinIO
  │                                                        │
  │─── 1. InitiateMultipartUpload (POST /bucket/key) ─────►│
  │◄── Returns UploadId ───────────────────────────────────│
  │                                                        │
  │─── 2. UploadPart (Part 1, UploadId, Data) ────────────►│
  │◄── Returns ETag1 ──────────────────────────────────────│
  │─── 2. UploadPart (Part 2, UploadId, Data) ────────────►│
  │◄── Returns ETag2 ──────────────────────────────────────│
  │                                                        │
  │─── 3. CompleteMultipartUpload (UploadId + ETag List) ─►│
  │◄── 200 OK (Object becomes visible atomically) ─────────│
```

1. **Initiate:** The client notifies the storage engine of its intent. The server registers an active session and returns an `UploadId`.
2. **Upload Parts:** The client splits the file into chunks (from 5 MB to 5 GB each) and uploads them independently using distinct HTTP `PUT` requests tagged with the `UploadId` and a sequential `PartNumber`. Parts can be uploaded concurrently, and failed parts can be retried individually.
3. **Complete:** The client sends an XML/JSON payload listing every `PartNumber` alongside its verified `ETag` checksum. The storage engine validates the list, stitches the parts together internally, and makes the immutable object visible to readers.

---

## 4. MinIO Architecture: Storage Layout on Linux

MinIO implements the standard S3 API specification while running directly on top of commodity Linux filesystems (`ext4` or `XFS`) without requiring an external relational database (like MySQL or PostgreSQL) to track object catalogs.

### The On-Disk Mapping

When a bucket and object are written to a MinIO storage volume:
* The **bucket** maps directly to a standard filesystem folder: `/data/bucket-a/`.
* The **key** maps to a filesystem directory path terminating in an object folder:
  `photos/vacation/beach.png` $\rightarrow$ `/data/bucket-a/photos/vacation/beach.png/`.

### Anatomy of an Object Directory

Inside that folder, MinIO stores two primary files:

```
/data/bucket-a/photos/vacation/beach.png/
├── xl.meta   ◄── Binary metadata file (schema, ETags, EC layout, HighwayHash)
└── part.1    ◄── Raw object payload data
```

1. **`xl.meta`:** Stores all S3 metadata headers, user tags, timestamps, part manifests, and erasure coding configurations.
2. **`part.1` (or multiple parts):** The raw encrypted or unencrypted data payload chunks.
3. **Atomic Commit via POSIX Rename:** When a write finishes, MinIO writes the metadata and data to temporary locations and performs an atomic directory rename. Because POSIX directory renames are atomic, reads never encounter partially written or corrupted states.

---

## 5. Distributed Systems: Partitions, Split-Brain, and Quorum

When scaling across an array of nodes, network stability cannot be guaranteed. Understanding how nodes reach consensus during network failures is essential to maintaining data integrity.

### What Causes a Network Partition?

A network partition occurs when servers remain fully functional and running, but the communication link between them breaks (due to top-of-rack switch failures, severed cables, or routing misconfigurations).

```
┌─────────────────────────────────┐       ┌─────────────────────────────────┐
│         Rack 1 (Group A)        │       │         Rack 2 (Group B)        │
│  Node 1    Node 2    Node 3     │  XXX  │  Node 4    Node 5    Node 6     │
│  (All nodes running normally)   │  XXX  │  (All nodes running normally)   │
└─────────────────────────────────┘  Network  └─────────────────────────────────┘
                                   Partition
```

---

### The Split-Brain Problem

If both Group A and Group B believe they are the authoritative cluster:
* **Client A** writes to Group A: `balance = $100` $\rightarrow$ Group A commits.
* **Client B** writes to Group B: `balance = $200` $\rightarrow$ Group B commits.

When the network link recovers, both groups hold contradictory versions of the truth with valid success confirmations. Resolving this leads to silent data loss or corrupted application state.

---

### Preventing Split-Brain: Strict Majority Quorum

To make split-brain mathematically impossible, distributed systems enforce that writes require agreement from a **strict majority** of the total cluster nodes $N$:

$$\text{Write Quorum} \ge \left\lfloor \frac{N}{2} \right\rfloor + 1$$

#### Evaluating Even vs. Odd Partitions

* **Cluster of $N = 5$ nodes:**
  $$\text{Quorum} = \left\lfloor \frac{5}{2} \right\rfloor + 1 = 2 + 1 = 3$$
  If partitioned into sets of $\{3\}$ and $\{2\}$, only the partition with 3 nodes can accept writes. The partition with 2 nodes rejects all incoming writes.

* **Cluster of $N = 4$ nodes:**
  $$\text{Quorum} = \left\lfloor \frac{4}{2} \right\rfloor + 1 = 2 + 1 = 3$$
  If partitioned evenly into $\{2\}$ and $\{2\}$, **neither side** can reach 3. Both sides reject write operations, sacrificing write availability to preserve data consistency.

---

### Read vs. Write Quorum Intersection (Pigeonhole Principle)

To guarantee that any read operation (`GET`) always sees the freshest write without reading every single node in the cluster, systems configure write quorum ($W$) and read quorum ($R$) such that their combined sum exceeds the total cluster size ($N$):

$$W + R > N$$

```
Total Nodes: N = 5  { Node 1, Node 2, Node 3, Node 4, Node 5 }

Write Set (W = 3):  [ Node 1    Node 2    Node 3 ]
Read Set  (R = 3):              [ Node 3    Node 4    Node 5 ]
                                     ▲
                            Guaranteed Overlap!
```

Because the two sets must overlap by at least one node, the read set is guaranteed to include at least one node holding the latest version of `xl.meta`. The client compares version numbers across the responses, discards any stale data, and reads the correct object.

