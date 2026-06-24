# Chat App - API & Socket Reference

**Base URL:** `http://localhost:5000`
**Socket URL:** `http://localhost:5000`

---

## 🔐 AUTH APIs

### 1. Register
```
POST http://localhost:5000/api/auth/register
```
**Headers:**
```json
{ "Content-Type": "application/json" }
```
**Body:**
```json
{
  "name": "Aditya",
  "email": "aditya@gmail.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```
**Response (201):**
```json
{
  "_id": "6789abc...",
  "name": "Aditya",
  "email": "aditya@gmail.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### 2. Login
```
POST http://localhost:5000/api/auth/login
```
**Headers:**
```json
{ "Content-Type": "application/json" }
```
**Body:**
```json
{
  "email": "aditya@gmail.com",
  "password": "123456"
}
```
**Response (200):**
```json
{
  "_id": "6789abc...",
  "name": "Aditya",
  "email": "aditya@gmail.com",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 👤 USER APIs (Token Required)

> **Header sabhi mein lagana hai:**
> ```json
> {
>   "Content-Type": "application/json",
>   "Authorization": "Bearer <TOKEN_YAHAN_DALO>"
> }
> ```

### 3. Get All Users (Find new people)
```
GET http://localhost:5000/api/users/all
```
**Response (200):**
```json
[
  { "_id": "abc123", "name": "Rahul", "email": "rahul@gmail.com", "isOnline": false }
]
```

---

### 4. Send Friend Request
```
POST http://localhost:5000/api/users/request/:id
```
> `:id` = jise request bhejni hai uska `_id`

**Example:** `POST http://localhost:5000/api/users/request/6789def456`

**Body:** None

**Response (200):**
```json
{ "message": "Friend request sent successfully" }
```

---

### 5. Get Pending Friend Requests
```
GET http://localhost:5000/api/users/requests
```
**Response (200):**
```json
[
  { "_id": "abc123", "name": "Rahul", "email": "rahul@gmail.com", "isOnline": false }
]
```

---

### 6. Accept Friend Request
```
POST http://localhost:5000/api/users/accept/:id
```
> `:id` = jisne request bheji uska `_id`

**Example:** `POST http://localhost:5000/api/users/accept/6789def456`

**Body:** None

**Response (200):**
```json
{ "message": "Friend request accepted" }
```

---

### 7. Get Friends List
```
GET http://localhost:5000/api/users/friends
```
**Response (200):**
```json
[
  { "_id": "abc123", "name": "Rahul", "email": "rahul@gmail.com", "isOnline": false }
]
```

---

## 💬 MESSAGE APIs (Token Required)

### 8. Send Message (Save to DB)
```
POST http://localhost:5000/api/messages
```
**Body:**
```json
{
  "receiverId": "6789def456",
  "text": "Hello bhai!"
}
```
**Response (201):**
```json
{
  "_id": "msg123...",
  "sender": "6789abc...",
  "receiver": "6789def456",
  "text": "Hello bhai!",
  "createdAt": "2026-06-24T12:00:00.000Z",
  "updatedAt": "2026-06-24T12:00:00.000Z"
}
```

---

### 9. Get Chat History (Between 2 users)
```
GET http://localhost:5000/api/messages/:receiverId
```
> `:receiverId` = dost ka `_id`

**Example:** `GET http://localhost:5000/api/messages/6789def456`

**Response (200):**
```json
[
  {
    "_id": "msg1",
    "sender": "6789abc...",
    "receiver": "6789def456",
    "text": "Hello bhai!",
    "createdAt": "2026-06-24T12:00:00.000Z"
  },
  {
    "_id": "msg2",
    "sender": "6789def456",
    "receiver": "6789abc...",
    "text": "Kya haal hai?",
    "createdAt": "2026-06-24T12:01:00.000Z"
  }
]
```

---

## ⚡ SOCKET.IO EVENTS

**Socket URL:** `http://localhost:5000`

> [!IMPORTANT]
> Socket.IO ko Postman mein test nahi kar sakte (HTTP nahi hai, WebSocket hai). Iske liye **Postman WebSocket** ya browser console use karo.

### Client → Server (Emit karne wale)

| Event Name | Data (JSON) | Description |
|---|---|---|
| `register_user` | `"USER_ID_STRING"` | Login ke baad apna userId bhejo |
| `private_message` | `{ "senderId": "abc", "receiverId": "def", "text": "Hi", "time": "05:30 PM", "senderName": "Aditya" }` | 1-on-1 message bhejne ke liye |
| `send_message` | `{ "text": "Hello everyone", "time": "05:30 PM", "username": "Aditya" }` | Global chat room mein message |

### Server → Client (Listen karne wale)

| Event Name | Data (JSON) | Description |
|---|---|---|
| `online_users` | `["userId1", "userId2", "userId3"]` | Online users ki list (array of IDs) |
| `receive_private_message` | `{ "senderId": "abc", "receiverId": "def", "text": "Hi", "time": "05:30 PM", "senderName": "Aditya" }` | Private message receive hoga |
| `receive_message` | `{ "text": "Hello everyone", "time": "05:30 PM", "username": "Aditya" }` | Global chat message receive hoga |

---

## 🧪 Postman Testing Flow

1. **Register** → POST `/api/auth/register` → token milega
2. **Login** → POST `/api/auth/login` → token milega
3. Token ko `Authorization: Bearer <token>` header mein daalo
4. **Get All Users** → GET `/api/users/all`
5. **Send Friend Request** → POST `/api/users/request/:id`
6. (Dusre account se) **Get Requests** → GET `/api/users/requests`
7. (Dusre account se) **Accept Request** → POST `/api/users/accept/:id`
8. **Get Friends** → GET `/api/users/friends`
9. **Send Message** → POST `/api/messages` (body mein receiverId + text)
10. **Get Chat History** → GET `/api/messages/:receiverId`
