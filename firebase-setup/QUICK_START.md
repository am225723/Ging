# Quick Start Guide: Firebase Migration

This guide will help you quickly set up and deploy your migrated Firebase application.

## Prerequisites

- Node.js 18+ installed
- Firebase CLI installed: `npm install -g firebase-tools`
- A Google account
- Your Gemini API key

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "ging-app")
4. Follow the prompts to create the project

## Step 2: Enable Firebase Services

In your Firebase Console:

### Authentication
1. Go to **Authentication** → **Get Started**
2. Click **Email/Password** → Enable → Save

### Firestore Database
1. Go to **Firestore Database** → **Create Database**
2. Start in **production mode**
3. Choose location (e.g., us-central1)

### Cloud Functions
1. Go to **Functions** → **Get Started**
2. Upgrade to Blaze plan (pay-as-you-go, required for Cloud Functions)

## Step 3: Set Up Your Local Project

```bash
# Navigate to your project
cd Ging

# Copy Firebase setup files to project root
cp -r firebase-setup/* .

# Install dependencies
npm install firebase

# Install Cloud Functions dependencies
cd functions
npm install
cd ..

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select:
# - Functions (already configured)
# - Firestore (already configured)
# - Hosting (already configured)
# - Use existing project (select your project)
```

## Step 4: Configure Environment Variables

### Frontend Environment Variables

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Firebase config:

1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click "Add app" → Web (</>) icon
4. Register app (name it "Ging Web App")
5. Copy the config values to your `.env` file

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123

VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_USE_EMULATORS=false
```

### Cloud Functions Environment Variables

Set the Gemini API key for Cloud Functions:

```bash
firebase functions:config:set gemini.api_key="YOUR_GEMINI_API_KEY"
```

For local development, create `functions/.runtimeconfig.json`:

```json
{
  "gemini": {
    "api_key": "YOUR_GEMINI_API_KEY"
  }
}
```

**Important**: Add `functions/.runtimeconfig.json` to `.gitignore`!

## Step 5: Deploy Firestore Rules and Indexes

```bash
# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

## Step 6: Deploy Cloud Functions

```bash
# Deploy all functions
firebase deploy --only functions

# Or deploy specific functions
firebase deploy --only functions:journalAi
firebase deploy --only functions:exposureLadder
firebase deploy --only functions:reframeForge
```

## Step 7: Update Frontend Code

### Replace Supabase Client

1. Delete `src/services/supabaseClient.js`
2. Copy new files from `firebase-setup/src/`:
   - `src/config/firebase.js`
   - `src/contexts/AuthContext.jsx`
   - `src/services/firestoreClient.js`
   - `src/services/journalAiClient.js`
   - `src/services/exposureLadderClient.js`
   - `src/services/reframeForgeClient.js`

### Update Imports

In all your component files, update imports:

**Before (Supabase):**
```javascript
import { supabase } from '../services/supabaseClient';
```

**After (Firebase):**
```javascript
import { auth, db, functions } from '../config/firebase';
import { getUserDocuments, createDocument, updateDocument, deleteDocument } from '../services/firestoreClient';
```

### Update Database Operations

**Before (Supabase):**
```javascript
const { data, error } = await supabase
  .from('journal_entries')
  .select('*')
  .order('created_at', { ascending: false });
```

**After (Firebase):**
```javascript
const { data, error } = await getUserDocuments('journal_entries', user.uid);
```

## Step 8: Test Locally with Emulators

```bash
# Start Firebase emulators
firebase emulators:start

# In another terminal, start your dev server
npm run dev
```

Update `.env` for local testing:
```env
VITE_USE_EMULATORS=true
```

Visit `http://localhost:5173` to test your app with emulators.

## Step 9: Build and Deploy Frontend

```bash
# Build the frontend
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

Your app will be live at: `https://your-project-id.web.app`

## Step 10: Verify Everything Works

Test the following features:

1. **Authentication**
   - Sign up new user
   - Sign in
   - Sign out

2. **Journal**
   - Create entry
   - View entries
   - Update entry
   - Delete entry
   - AI processing (all modes)

3. **Exposure Ladder**
   - Generate ladder
   - View ladders
   - Update steps
   - Delete ladder

4. **Reframe Forge**
   - Generate reframe
   - View reframes
   - Delete reframe

## Common Commands

```bash
# Deploy everything
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only Firestore rules
firebase deploy --only firestore:rules

# View function logs
firebase functions:log

# Start emulators
firebase emulators:start

# Check Firebase project info
firebase projects:list
```

## Troubleshooting

### Issue: "Permission denied" errors

**Solution**: Check Firestore security rules are deployed:
```bash
firebase deploy --only firestore:rules
```

### Issue: Functions return 401 Unauthorized

**Solution**: Make sure you're authenticated and the token is being sent. Firebase SDK handles this automatically with `httpsCallable`.

### Issue: "Index required" error

**Solution**: Click the link in the error message to create the index, or add it to `firestore.indexes.json` and deploy.

### Issue: Functions timeout

**Solution**: Increase timeout in function definition:
```javascript
exports.myFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onRequest(async (req, res) => {
    // ...
  });
```

### Issue: CORS errors

**Solution**: Make sure CORS is properly configured in each function. Check that the `cors` utility is imported and used.

## Next Steps

1. **Remove Supabase Code**
   - Delete `supabase/` directory
   - Remove Supabase dependencies: `npm uninstall @supabase/supabase-js`
   - Remove Supabase environment variables

2. **Set Up Monitoring**
   - Enable Firebase Performance Monitoring
   - Set up error tracking
   - Configure billing alerts

3. **Optimize Performance**
   - Add Firestore indexes as needed
   - Consider using minimum instances for functions
   - Implement caching strategies

4. **Update Documentation**
   - Update README.md
   - Document new environment variables
   - Update deployment procedures

## Support

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

## Cost Estimation

Firebase offers a generous free tier:

- **Authentication**: 50,000 MAU free
- **Firestore**: 1 GB storage, 50K reads, 20K writes per day free
- **Cloud Functions**: 2M invocations, 400K GB-seconds per month free
- **Hosting**: 10 GB storage, 360 MB/day transfer free

For most small to medium applications, you'll stay within the free tier.

---

**Congratulations!** 🎉 Your application is now running on Firebase with Node.js Cloud Functions!