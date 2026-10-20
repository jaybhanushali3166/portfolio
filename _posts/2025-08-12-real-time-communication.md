---
layout: post
title: Real-Time Communication
subtitle: SSE vs WebSockets vs WebRTC
gh-repo: jaybhanushali3166/me
gh-badge: [star, fork, follow]
tags: [system-design, real-time, web]
comments: true
author: Jay Bhanushali
---

# **System Design: Real-Time Communication**

SSE (Server-Sent Events), WebSockets, and WebRTC are all technologies that enable real-time communication in web applications, but they differ significantly in their approach and ideal use cases.

Here's a breakdown of the key differences:

**1. Server-Sent Events (SSE)**

- **Communication:** One-way, from server to client only.
- **Protocol:** Built on HTTP, maintaining an open connection to stream updates.
- **Best for:** Real-time updates, notifications, and live feeds where the server is pushing information to the client without needing a response, like live sports scores, stock tickers, or news feeds.
- **Advantages:**
    - Simple to implement on both the server and client side.
    - Leverages existing HTTP infrastructure, including proxies and firewalls.
    - Automatic reconnection upon disconnection.
- **Disadvantages:**
    - Limited to one-way communication.
    - Less suitable for interactive applications requiring two-way communication.
    - Older browsers might lack native support.

**Example**:

```jsx
// server.js
const express = require("express");
const app = express();

app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");

  setInterval(() => {
    res.write(`data: ${new Date().toISOString()}\\n\\n`);
  }, 2000);
});

app.listen(3000, () => console.log("SSE running on port 3000"));

// client.js (Browser)
const evtSource = new EventSource("<http://localhost:3000/events>");
evtSource.onmessage = (e) => console.log("New event:", e.data);
```

**2. WebSockets**

- **Communication:** Two-way (full-duplex) communication between client and server.
- **Protocol:** A separate WebSocket protocol, initially established via an HTTP handshake.
- **Best for:** Interactive real-time applications requiring frequent back-and-forth communication, such as chat applications, online multiplayer games, and collaborative tools.
- **Advantages:**
    - Low latency and high performance for real-time interaction.
    - Supports both text and binary data, allowing for richer communication.
- **Disadvantages:**
    - More complex to implement than SSE.
    - Requires more server resources to maintain persistent connections.
    
    **Example:**
    

```jsx
// server.js
const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws) => {
  ws.send("Hello from server!");

  ws.on("message", (msg) => {
    console.log("Received:", msg);
    ws.send(`Echo: ${msg}`);
  });
});

// client.js (Browser)
const socket = new WebSocket("ws://localhost:3000");
socket.onmessage = (e) => console.log("From server:", e.data);
socket.onopen = () => socket.send("Hello from client!");
```

**3. WebRTC (Web Real-Time Communication)**

- **Communication:** Peer-to-peer (P2P), direct communication between clients.
- **Protocol:** Utilizes various protocols like STUN and TURN for connection establishment and media streaming.
- **Best for:** Real-time audio, video, and data streaming between users without a central server intermediary, like video conferencing, peer-to-peer file sharing, and online gaming where players interact directly.
- **Advantages:**
    - Ultra-low latency due to direct peer-to-peer connections.
    - Efficient for media streaming (audio and video).
    - No need for media servers once the connection is established.
    - Includes built-in security features for media encryption.
- **Disadvantages:**
    - More complex setup due to the need for STUN and TURN servers for initial connection and NAT traversal.
    - Scalability can be challenging for a large number of participants.
    - WebRTC itself doesn't provide a signaling mechanism for setting up the initial connection; WebSockets are commonly used for this purpose.
    
    **Example**
    

```jsx
// client.js (Browser A)
const peer = new RTCPeerConnection();
const channel = peer.createDataChannel("chat");

channel.onopen = () => channel.send("Hello from A!");
channel.onmessage = (e) => console.log("From B:", e.data);

peer.createOffer().then(offer => peer.setLocalDescription(offer));

```

```jsx
// client.js (Browser B)
const peer = new RTCPeerConnection();
peer.ondatachannel = (e) => {
  const channel = e.channel;
  channel.onmessage = (msg) => console.log("From A:", msg.data);
  channel.onopen = () => channel.send("Hello from B!");
};

```

**Choosing the right technology**

The best choice depends on the specific requirements of your application:

- **For server-to-client notifications or updates:** **SSE** is the simplest and most efficient choice.
- **For interactive chat, gaming, or collaborative tools requiring real-time, two-way data exchange:** **WebSockets** are the ideal solution.
- **For real-time audio/video streaming or peer-to-peer applications like video conferencing:** **WebRTC** is designed for this and provides optimized performance.

It's also worth noting that these technologies can be combined. For instance, WebSockets are often used for signaling and initial setup in WebRTC applications before the direct peer-to-peer connection is established.