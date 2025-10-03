# Firebase Migration Package

This directory contains all the necessary files and documentation to migrate your application from Supabase to Firebase and convert Deno Edge Functions to Node.js Cloud Functions.

## 📁 Package Contents

### Documentation
- **FIREBASE_MIGRATION_GUIDE.md** - Comprehensive step-by-step migration guide
- **QUICK_START.md** - Quick start guide for rapid deployment
- **MIGRATION_CHECKLIST.md** - Detailed checklist to track migration progress
- **README.md** - This file

### Configuration Files
- **firebase.json** - Firebase project configuration
- **firestore.rules** - Firestore security rules
- **firestore.indexes.json** - Firestore database indexes
- **.env.example** - Environment variables template

### Cloud Functions (Node.js)
- **functions/** - Complete Cloud Functions implementation
  - **index.js** - Main entry point
  - **journal-ai.js** - Journal AI processing function
  - **exposure-ladder.js** - Exposure ladder generation function
  - **reframe-forge.js** - Cognitive reframe function
  - **utils/** - Shared utilities
    - **cors.js** - CORS configuration
    - **auth.js** - Authentication helpers
    - **gemini.js** - Gemini API integration
  - **package.json** - Dependencies
  - **.eslintrc.js** - ESLint configuration

### Frontend Code
- **src/** - Updated frontend code
  - **config/firebase.js** - Firebase initialization
  - **contexts/AuthContext.jsx** - Firebase Authentication context
  - **services/** - Service layer
    - **firestoreClient.js** - Firestore database operations
    - **journalAiClient.js** - Journal AI client
    - **exposureLadderClient.js** - Exposure ladder client
    - **reframeForgeClient.js** - Reframe forge client

### Automation
- **migrate.sh** - Migration helper script (Unix/Mac)

## 🚀 Quick Start

### Option 1: Automated Migration (Recommended)

```bash
# Make the script executable (if not already)
chmod +x firebase-setup/migrate.sh

# Run the migration helper
./firebase-setup/migrate.sh
```

The script will:
1. Copy all Firebase configuration files
2. Install dependencies
3. Guide you through environment setup
4. Deploy Firestore rules and indexes
5. Deploy Cloud Functions

### Option 2: Manual Migration

Follow the detailed guide in **QUICK_START.md** for step-by-step instructions.

## 📋 Migration Overview

### What Changes

| Component | Before (Supabase) | After (Firebase) |
|-----------|-------------------|------------------|
| Database | PostgreSQL | Firestore (NoSQL) |
| Auth | Supabase Auth | Firebase Auth |
| Functions | Deno Edge Functions | Node.js Cloud Functions |
| Runtime | Deno | Node.js 18 |
| Queries | SQL-like | Document-based |

### What Stays the Same

- Frontend framework (React + Vite)
- UI components and styling
- Application logic
- Gemini AI integration
- User experience

## 📚 Documentation Guide

### For First-Time Users
1. Start with **QUICK_START.md**
2. Use **MIGRATION_CHECKLIST.md** to track progress
3. Refer to **FIREBASE_MIGRATION_GUIDE.md** for detailed explanations

### For Experienced Developers
1. Review **FIREBASE_MIGRATION_GUIDE.md** sections 1-2
2. Run **migrate.sh** script
3. Update component files as needed
4. Test and deploy

## 🔧 Key Files to Update

After running the migration, you'll need to update these files in your project:

### Must Update
- `src/pages/Journal.jsx` - Update database operations
- `src/pages/ExposureLadder.jsx` - Update database operations
- `src/pages/ReframeForge.jsx` - Update database operations
- Any other components using Supabase

### Auto-Replaced
- `src/config/firebase.js` (replaces supabaseClient.js)
- `src/contexts/AuthContext.jsx`
- `src/services/*Client.js` files

## 🧪 Testing

### Local Testing with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal
npm run dev
```

Set in `.env`:
```env
VITE_USE_EMULATORS=true
```

### Production Testing

```bash
# Build
npm run build

# Preview locally
npm run preview

# Deploy
firebase deploy
```

## 📊 Database Schema Mapping

### Supabase → Firestore

**journal_entries** table → **journal_entries** collection
```javascript
// Supabase (PostgreSQL)
{
  id: uuid,
  user_id: uuid,
  created_at: timestamp,
  title: text,
  content: text,
  mood: integer,
  tags: text[]
}

// Firestore (NoSQL)
{
  id: auto-generated,
  userId: string,
  createdAt: timestamp,
  title: string,
  content: string,
  mood: number,
  tags: array
}
```

**exposure_ladders** table → **exposure_ladders** collection
**reframes** table → **reframes** collection

See **FIREBASE_MIGRATION_GUIDE.md** Section 2.2 for complete schema details.

## 🔐 Security

### Firestore Security Rules

The included `firestore.rules` file ensures:
- Users can only access their own data
- Authentication is required for all operations
- Required fields are validated on creation

### Cloud Functions Security

- All functions verify Firebase ID tokens
- CORS is properly configured
- User ID is extracted from authenticated token

## 💰 Cost Comparison

### Supabase (Free Tier)
- 500 MB database
- 2 GB bandwidth
- 50,000 monthly active users

### Firebase (Free Tier)
- 1 GB Firestore storage
- 50K reads, 20K writes per day
- 2M Cloud Function invocations per month
- 10 GB hosting storage

**Most small to medium apps stay within free tier!**

## 🆘 Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Deploy Firestore rules: `firebase deploy --only firestore:rules`

2. **Functions return 401**
   - Check authentication token is being sent
   - Verify user is logged in

3. **"Index required" error**
   - Click the link in error to create index
   - Or add to `firestore.indexes.json` and deploy

4. **CORS errors**
   - Verify CORS is configured in functions
   - Check function logs: `firebase functions:log`

See **FIREBASE_MIGRATION_GUIDE.md** Section 8 for more solutions.

## 📞 Support Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Cloud Functions Guide](https://firebase.google.com/docs/functions)
- [Migration Guide](./FIREBASE_MIGRATION_GUIDE.md)

## ✅ Success Checklist

- [ ] Firebase project created
- [ ] All services enabled (Auth, Firestore, Functions)
- [ ] Environment variables configured
- [ ] Firestore rules deployed
- [ ] Cloud Functions deployed
- [ ] Frontend code updated
- [ ] Local testing completed
- [ ] Production deployment successful
- [ ] All features verified working

## 🎯 Next Steps After Migration

1. **Remove Supabase Code**
   ```bash
   rm -rf supabase/
   npm uninstall @supabase/supabase-js
   ```

2. **Update Documentation**
   - Update README.md
   - Document new environment variables
   - Update deployment procedures

3. **Set Up Monitoring**
   - Enable Firebase Performance Monitoring
   - Configure error tracking
   - Set up billing alerts

4. **Optimize**
   - Add Firestore indexes as needed
   - Consider minimum instances for functions
   - Implement caching strategies

## 📝 Notes

- Keep Supabase project active for 30 days as backup
- Monitor Firebase usage and costs
- Test thoroughly before decommissioning Supabase
- Update team documentation

## 🎉 Congratulations!

Once you complete the migration, your application will be running on:
- ✅ Firebase Authentication
- ✅ Firestore Database
- ✅ Node.js Cloud Functions
- ✅ Firebase Hosting

All with the same great user experience!

---

**Need Help?** Refer to the comprehensive guides in this directory or check the Firebase documentation.