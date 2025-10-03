# Firebase Migration Checklist

Use this checklist to track your migration progress from Supabase to Firebase.

## Pre-Migration

- [ ] Backup all Supabase data
- [ ] Document current Supabase configuration
- [ ] Note all environment variables
- [ ] List all Supabase Edge Functions
- [ ] Identify all database tables and their relationships
- [ ] Review current authentication setup

## Firebase Project Setup

- [ ] Create Firebase project in console
- [ ] Enable Email/Password authentication
- [ ] Create Firestore database (production mode)
- [ ] Upgrade to Blaze plan (for Cloud Functions)
- [ ] Note Firebase project ID
- [ ] Get Firebase web app configuration

## Local Development Setup

- [ ] Install Firebase CLI: `npm install -g firebase-tools`
- [ ] Login to Firebase: `firebase login`
- [ ] Copy firebase-setup files to project root
- [ ] Install Firebase SDK: `npm install firebase`
- [ ] Create `.env` file with Firebase config
- [ ] Install Cloud Functions dependencies: `cd functions && npm install`

## Environment Configuration

- [ ] Add Firebase config to `.env` file
  - [ ] VITE_FIREBASE_API_KEY
  - [ ] VITE_FIREBASE_AUTH_DOMAIN
  - [ ] VITE_FIREBASE_PROJECT_ID
  - [ ] VITE_FIREBASE_STORAGE_BUCKET
  - [ ] VITE_FIREBASE_MESSAGING_SENDER_ID
  - [ ] VITE_FIREBASE_APP_ID
  - [ ] VITE_GEMINI_API_KEY (copy from existing)
- [ ] Set Gemini API key for functions: `firebase functions:config:set gemini.api_key="YOUR_KEY"`
- [ ] Create `functions/.runtimeconfig.json` for local development
- [ ] Add `.runtimeconfig.json` to `.gitignore`

## Firestore Setup

- [ ] Deploy Firestore security rules: `firebase deploy --only firestore:rules`
- [ ] Deploy Firestore indexes: `firebase deploy --only firestore:indexes`
- [ ] Verify rules in Firebase Console
- [ ] Test rules with Firebase Emulator

## Cloud Functions Deployment

- [ ] Review function code in `functions/` directory
- [ ] Test functions locally with emulator
- [ ] Deploy journal-ai function: `firebase deploy --only functions:journalAi`
- [ ] Deploy exposure-ladder function: `firebase deploy --only functions:exposureLadder`
- [ ] Deploy reframe-forge function: `firebase deploy --only functions:reframeForge`
- [ ] Verify functions in Firebase Console
- [ ] Check function logs for errors

## Frontend Code Migration

### File Replacements
- [ ] Replace `src/services/supabaseClient.js` with `src/config/firebase.js`
- [ ] Replace `src/contexts/AuthContext.jsx` with new Firebase version
- [ ] Add `src/services/firestoreClient.js`
- [ ] Replace `src/services/journalAiClient.js`
- [ ] Replace `src/services/exposureLadderClient.js`
- [ ] Replace `src/services/reframeForgeClient.js`

### Component Updates
- [ ] Update Journal.jsx to use Firestore
- [ ] Update ExposureLadder.jsx to use Firestore
- [ ] Update ReframeForge.jsx to use Firestore
- [ ] Update Login.jsx (if needed)
- [ ] Update any other components using Supabase

### Import Updates
- [ ] Replace all Supabase imports with Firebase imports
- [ ] Update database query syntax
- [ ] Update authentication method calls
- [ ] Update Cloud Function invocations

## Testing with Emulators

- [ ] Start Firebase emulators: `firebase emulators:start`
- [ ] Set `VITE_USE_EMULATORS=true` in `.env`
- [ ] Test authentication flow
  - [ ] Sign up
  - [ ] Sign in
  - [ ] Sign out
  - [ ] Protected routes
- [ ] Test Journal functionality
  - [ ] Create entry
  - [ ] Read entries
  - [ ] Update entry
  - [ ] Delete entry
  - [ ] AI summarize
  - [ ] AI insights
  - [ ] AI actions
  - [ ] AI rewrite
  - [ ] AI ask
- [ ] Test Exposure Ladder functionality
  - [ ] Generate ladder
  - [ ] View ladders
  - [ ] Update step completion
  - [ ] Delete ladder
- [ ] Test Reframe Forge functionality
  - [ ] Generate reframe
  - [ ] View reframes
  - [ ] Delete reframe

## Data Migration (if needed)

- [ ] Export data from Supabase
  - [ ] Export journal_entries
  - [ ] Export exposure_ladders
  - [ ] Export reframes
  - [ ] Export user data
- [ ] Transform data for Firestore format
- [ ] Import data to Firestore
- [ ] Verify data integrity
- [ ] Test with migrated data

## Production Deployment

- [ ] Set `VITE_USE_EMULATORS=false` in `.env`
- [ ] Build frontend: `npm run build`
- [ ] Test production build locally: `npm run preview`
- [ ] Deploy to Firebase Hosting: `firebase deploy --only hosting`
- [ ] Verify deployment at Firebase URL
- [ ] Test all features in production

## Post-Migration

- [ ] Update DNS (if using custom domain)
- [ ] Set up Firebase Performance Monitoring
- [ ] Configure error tracking
- [ ] Set up billing alerts
- [ ] Update documentation
  - [ ] README.md
  - [ ] Deployment guide
  - [ ] Environment variables
- [ ] Remove Supabase code
  - [ ] Delete `supabase/` directory
  - [ ] Uninstall Supabase package: `npm uninstall @supabase/supabase-js`
  - [ ] Remove Supabase environment variables
  - [ ] Remove Supabase imports
- [ ] Archive Supabase project (don't delete immediately)
- [ ] Monitor Firebase usage and costs
- [ ] Notify users of migration (if applicable)

## Verification

- [ ] All authentication flows work
- [ ] All CRUD operations work
- [ ] All AI features work
- [ ] No console errors
- [ ] No broken links
- [ ] Performance is acceptable
- [ ] Security rules are working
- [ ] All tests pass

## Rollback Plan (Just in Case)

- [ ] Keep Supabase project active for 30 days
- [ ] Document rollback procedure
- [ ] Keep backup of Supabase data
- [ ] Keep old environment variables
- [ ] Have old code in git history

## Success Criteria

- [ ] All features working in production
- [ ] No critical errors in logs
- [ ] Users can authenticate and use all features
- [ ] Performance meets expectations
- [ ] Costs are within budget
- [ ] Team is comfortable with new setup

---

## Notes

Use this section to track any issues, decisions, or important information during migration:

- 
- 
- 

## Timeline

- Migration Start Date: ___________
- Expected Completion: ___________
- Actual Completion: ___________

## Team Sign-off

- [ ] Developer: ___________
- [ ] QA: ___________
- [ ] Product Owner: ___________