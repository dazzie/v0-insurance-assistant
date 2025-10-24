# User Authentication & Data Persistence

## Overview

The insurance assistant now includes a complete user authentication system that allows users to:
- **Sign up** with email and password
- **Sign in** to access their saved data
- **Save their profile** (customer information, vehicles, risk assessments)
- **Save their quotes** for future reference
- **Auto-restore** their data when they log back in

## Features

### 🔐 Authentication
- **Email/Password Login**: Secure authentication using NextAuth.js
- **Password Hashing**: Passwords are hashed with bcrypt (10 rounds)
- **Session Management**: JWT-based sessions that last 30 days
- **Auto-Login**: After signup, users are automatically logged in

### 💾 Data Persistence
- **Profile Storage**: Complete customer profile including:
  - Personal information (name, email, address)
  - Vehicle details (with NHTSA enrichment)
  - Risk assessments (flood, crime, earthquake, wildfire)
  - Policy analysis results
  - Coverage preferences

- **Quote Storage**: All generated quotes with:
  - Quote details and pricing
  - Carrier information
  - Coverage levels
  - Timestamp

### 🎨 User Interface
- **User Menu**: Dropdown menu in the header showing:
  - User's name/email
  - Save Profile button
  - Load Profile button
  - View Saved Quotes button
  - Sign Out button

- **Login Page**: Clean, modern login/signup page with:
  - Toggle between login and signup
  - Form validation
  - Error handling
  - Option to continue without signing in

## File Structure

```
├── lib/
│   ├── db.ts                    # File-based database utilities
│   └── auth.ts                  # NextAuth configuration
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/route.ts  # NextAuth API route
│   │   │   └── signup/route.ts          # Signup endpoint
│   │   └── user/
│   │       ├── profile/route.ts         # Profile save/load
│   │       └── quotes/route.ts          # Quotes save/load
│   ├── login/page.tsx           # Login/signup page
│   └── layout.tsx               # Root layout with SessionProvider
├── components/
│   ├── providers.tsx            # SessionProvider wrapper
│   └── user-menu.tsx            # User menu dropdown
├── types/
│   └── next-auth.d.ts          # TypeScript types for NextAuth
└── .data/                       # User data storage (gitignored)
    ├── users.json               # User accounts
    ├── profiles/                # User profiles
    │   └── {userId}.json
    └── quotes/                  # User quotes
        └── {userId}.json
```

## Database Structure

### File-Based Storage
The system uses a simple file-based database stored in the `.data/` directory:

**users.json**:
```json
[
  {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "passwordHash": "$2b$10$...",
    "name": "John Doe",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "lastLogin": "2025-01-02T00:00:00.000Z"
  }
]
```

**profiles/{userId}.json**:
```json
{
  "userId": "user_1234567890_abc123",
  "profile": {
    "name": "John Doe",
    "email": "user@example.com",
    "vehicles": [...],
    "riskAssessment": {...},
    ...
  },
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

**quotes/{userId}.json**:
```json
{
  "userId": "user_1234567890_abc123",
  "quotes": [
    {
      "id": "quote_1234567890_xyz789",
      "carrier": "State Farm",
      "premium": "$1,200/year",
      "createdAt": "2025-01-02T00:00:00.000Z",
      ...
    }
  ],
  "updatedAt": "2025-01-02T00:00:00.000Z"
}
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)
- `POST /api/auth/signout` - Sign out (handled by NextAuth)

### User Data
- `GET /api/user/profile` - Load user's profile
- `POST /api/user/profile` - Save user's profile
- `GET /api/user/quotes` - Load user's quotes
- `POST /api/user/quotes` - Add a new quote

## Usage

### For Users

1. **Sign Up**:
   - Click "Sign In" in the header
   - Click "Sign up" to create an account
   - Enter email and password (min 6 characters)
   - Optionally enter your name

2. **Save Your Profile**:
   - After filling out your profile or uploading a policy
   - Click your name in the header
   - Select "Save Profile"

3. **Load Your Profile**:
   - Sign in with your credentials
   - Click your name in the header
   - Select "Load Profile"
   - Page will refresh with your saved data

4. **View Saved Quotes**:
   - Click your name in the header
   - Select "View Saved Quotes"

### For Developers

**Check if user is authenticated**:
```typescript
import { useSession } from 'next-auth/react'

function MyComponent() {
  const { data: session, status } = useSession()
  
  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not signed in</div>
  
  return <div>Welcome {session.user.name}!</div>
}
```

**Save user data**:
```typescript
const response = await fetch('/api/user/profile', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ profile: customerProfile })
})
```

**Load user data**:
```typescript
const response = await fetch('/api/user/profile')
const data = await response.json()
if (data.success && data.profile) {
  setCustomerProfile(data.profile)
}
```

## Security

### Password Security
- Passwords are hashed using bcrypt with 10 salt rounds
- Passwords must be at least 6 characters
- Plain-text passwords are never stored

### Session Security
- JWT-based sessions with 30-day expiration
- Sessions are signed with a secret key
- Session data is encrypted

### API Security
- All user data endpoints require authentication
- User can only access their own data
- Unauthorized requests return 401 status

## Migration Path

The current file-based database is designed to be easily migrated to a SQL database:

### To PostgreSQL:
```sql
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP NOT NULL,
  last_login TIMESTAMP
);

CREATE TABLE profiles (
  user_id VARCHAR(255) PRIMARY KEY REFERENCES users(id),
  profile_data JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE TABLE quotes (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) REFERENCES users(id),
  quote_data JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL
);
```

### To MongoDB:
```javascript
// users collection
{
  _id: ObjectId,
  email: String,
  passwordHash: String,
  name: String,
  createdAt: Date,
  lastLogin: Date
}

// profiles collection
{
  _id: ObjectId,
  userId: String,
  profile: Object,
  updatedAt: Date
}

// quotes collection
{
  _id: ObjectId,
  userId: String,
  quotes: Array,
  updatedAt: Date
}
```

## Environment Variables

Create a `.env.local` file:
```bash
# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-secret-key-here

# NextAuth URL (for production)
NEXTAUTH_URL=https://your-domain.com
```

## Troubleshooting

### "Unauthorized" errors
- Make sure you're signed in
- Check that your session hasn't expired
- Try signing out and back in

### Profile not loading
- Check browser console for errors
- Verify the profile was saved (check `.data/profiles/`)
- Try refreshing the page

### Can't sign in
- Verify email and password are correct
- Check that the user account exists
- Look for error messages on the login page

## Future Enhancements

- [ ] Email verification
- [ ] Password reset functionality
- [ ] OAuth providers (Google, GitHub)
- [ ] Profile sharing/export
- [ ] Quote comparison history
- [ ] Real-time sync across devices
- [ ] Migrate to PostgreSQL/MongoDB
- [ ] Add profile versioning
- [ ] Implement data encryption at rest

## Support

For issues or questions, please check:
1. Browser console for error messages
2. Server logs for API errors
3. `.data/` directory for data files
4. This README for common solutions

