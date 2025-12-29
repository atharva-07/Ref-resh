# Ref-resh

## A full-stack social media platform implementation

**Features Implemented:**

- OAuth 2.0 Authorization Flow and stateless authentication and authorization with JWT.
- User Feed (ranked on the basis of post metadata).
- Social interactions including posts, comments, stories, likes, following, blocking, etc.
- Real-time notification using Server Sent Events (SSE) for aforementioned interactions.
- Live chat with typing indicators, read receipts and user presence (online/offline) status.
- Audio calls using WebSocket, WebRTC and PeerJS.
- User profile sections with settings to toggle account type (public/private) and change password (through email link).
- Light/Dark theme.
- Integrated Cloudinary for cloud-based image uploads.
- Use of Aggregation Framework for efficient and complex data retrievals, lazy-loading via cursor-based pagination for all the calls that fetch multiple resources.
- Global search bar that searches users and posts (debounced).

> _Stack: React, Node, Apollo Client, Apollo Server, Express, WebSocket, WebRTC, PeerJS, SSE_

_There are a lot of things I'd love to add but this should be okay for now._
