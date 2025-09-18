# Software Download Manager - Backend

## 🔐 User Authentication & Data Storage

The backend now includes a complete user authentication system with secure data storage.

### 📊 **Data Storage**

#### **User Storage (`/data/userStorage.js`)**
- **In-Memory Database** - Stores user data during server runtime
- **User Data**: ID, Full Name, Email, Hashed Password, Timestamps
- **Functions**: Create, Find, Update, Delete users
- **Email Validation** - Prevents duplicate registrations

#### **Software Data (`/data/softwareData.js`)**
- **Static Software List** - 8 pre-loaded software items
- **Categories**: Browser, Media, Utilities
- **Data**: Name, Description, Size, Download Links

### 🔒 **Security Features**

#### **Password Security (`/utils/auth.js`)**
- **bcryptjs** - Passwords hashed with salt rounds (12)
- **JWT Tokens** - Secure authentication tokens
- **Token Expiration** - 24-hour default expiry
- **Middleware Protection** - Routes require valid tokens

### 📡 **API Endpoints**

#### **Authentication**
```
POST /api/register   - Register new user
POST /api/login      - Login user
GET  /api/profile    - Get user profile (Protected)
```

#### **Software Management**
```
GET  /api/software   - Get software list (Public)
POST /api/download   - Download software (Protected)
```

#### **System**
```
GET  /api/health     - Server health check
GET  /api/stats      - System statistics
```

### 🚀 **How User Data is Stored**

#### **Registration Process:**
1. **Validate Input** - Check email format, password length
2. **Check Duplicates** - Ensure email doesn't exist
3. **Hash Password** - Use bcrypt with salt
4. **Store User** - Save to in-memory storage
5. **Return Success** - Send confirmation (no password)

#### **Login Process:**
1. **Find User** - Search by email
2. **Verify Password** - Compare with hashed version
3. **Generate Token** - Create JWT with user data
4. **Return Token** - Send token + user info

#### **Example User Data Structure:**
```javascript
{
  id: 1,
  fullName: "John Doe",
  email: "john@example.com",
  password: "$2a$12$hashed_password_here",
  createdAt: "2024-09-18T10:30:00.000Z",
  updatedAt: "2024-09-18T10:30:00.000Z"
}
```

### 🔧 **Environment Variables**

```env
# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Server
PORT=5000
NODE_ENV=development
```

### 📦 **Required Packages**

```json
{
  "bcryptjs": "^2.4.3",     // Password hashing
  "jsonwebtoken": "^9.0.2", // JWT tokens
  "express": "^4.18.2",     // Web framework
  "cors": "^2.8.5",         // Cross-origin requests
  "dotenv": "^17.2.2"       // Environment variables
}
```

### ⚠️ **Production Notes**

**Current Setup (Development):**
- ✅ In-memory storage (data lost on restart)
- ✅ Basic security measures
- ✅ JWT authentication

**For Production:**
- 🔄 Replace in-memory storage with database (MongoDB, PostgreSQL)
- 🔄 Add rate limiting
- 🔄 Implement proper logging
- 🔄 Add input sanitization
- 🔄 Use HTTPS
- 🔄 Environment-specific JWT secrets

### 🧪 **Testing the System**

1. **Register a User:**
```bash
curl -X POST http://localhost:5000/api/register \
  -H "Content-Type: application/json" \
  -d '{"fullName":"John Doe","email":"john@example.com","password":"password123"}'
```

2. **Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

3. **Access Protected Route:**
```bash
curl -X GET http://localhost:5000/api/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

The system now provides complete user management with secure authentication! 🎉