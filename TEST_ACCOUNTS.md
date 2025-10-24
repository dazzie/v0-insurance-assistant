# 🔐 Test Accounts Available

## Available Test Users

Based on the current database (`.data/users.json`), here are the available test accounts:

### **1. Test User**
- **Email**: `test@example.com`
- **Password**: `password123` (likely)
- **Name**: Test User
- **Created**: 2025-10-23

### **2. John Brenna**
- **Email**: `john.brenna@email.com`
- **Password**: Unknown (created during testing)
- **Name**: John
- **Last Login**: 2025-10-24 00:09:01
- **Status**: Has profile and quotes data

### **3. Demo User**
- **Email**: `demo@example.com`
- **Password**: `demo123` (likely)
- **Name**: Demo User
- **Created**: 2025-10-23

### **4. Kenneth Crann**
- **Email**: `kenneth.crann@example.com` ⚠️ **NOT** `kennyg@example.com`
- **Password**: Unknown (created during testing)
- **Name**: Ken
- **Status**: Has profile and quotes data

### **5. Kenneth 1 Crann**
- **Email**: `kenneth1.crann@example.com`
- **Password**: Unknown
- **Name**: Ken

### **6. Kenny**
- **Email**: `kenny@example.com`
- **Password**: Unknown

### **7. Test Auth (New)**
- **Email**: `test-auth@example.com`
- **Password**: `test123`
- **Name**: Test Auth
- **Created**: Just now

## 🧪 **How to Test Login**

### **Recommended Test Account:**
```
Email: test-auth@example.com
Password: test123
```

### **Or Create New Account:**
1. Go to http://localhost:3000/login
2. Click "Sign up"
3. Enter any email and password (min 6 characters)
4. Account will be created automatically

## 🔧 **Common Login Issues**

### **401 Unauthorized Error:**
- ✅ **Fixed**: Added `NEXTAUTH_SECRET` to `.env.local`
- ✅ **Fixed**: Restarted server to load environment variables

### **Wrong Email:**
- ❌ **Issue**: User tried `kennyg@example.com`
- ✅ **Correct**: Should be `kenneth.crann@example.com`

### **Unknown Password:**
- Some test accounts were created without known passwords
- **Solution**: Create a new account or use known test accounts

## 🚀 **Test the Complete Flow**

### **Recommended Testing Steps:**
1. **Visit**: http://localhost:3000/login
2. **Sign up** with: `your-email@example.com` / `password123`
3. **Use the app**: Fill profile, upload policy, get quotes
4. **Sign out**: Test data persistence
5. **Sign back in**: Verify complete data restoration

### **Or Use Existing Account:**
1. **Visit**: http://localhost:3000/login
2. **Sign in** with: `test-auth@example.com` / `test123`
3. **Verify**: Should redirect to Your Profile page
4. **Check**: Data restoration and quote display

## 🎯 **Expected Behavior After Login**

1. **Auto-redirect** to `/?view=profile&restore=true`
2. **Data restoration** (watch sync indicator)
3. **Auto-switch** to "Your Profile" page
4. **Quote display** if user has saved quotes
5. **Context-aware chat** greeting

## ✅ **Authentication Fixed**

The 401 errors should now be resolved with:
- ✅ `NEXTAUTH_SECRET` environment variable set
- ✅ Server restarted with new configuration
- ✅ JWT session signing working properly

**Ready to test at: http://localhost:3000** 🚀
