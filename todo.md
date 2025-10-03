# Migration from Supabase to Firebase & Deno to Node.js

## Phase 1: Analysis & Planning
- [x] Clone and examine repository structure
- [x] Identify Supabase dependencies and usage patterns
- [x] Identify Deno Edge Functions and their dependencies
- [x] Document current architecture
- [x] Create Firebase project setup guide
- [x] Create Node.js backend structure plan

## Phase 2: Firebase Setup & Configuration
- [x] Create Firebase configuration files
- [x] Set up Firebase Authentication
- [x] Set up Firestore database schema
- [x] Configure Firebase Cloud Functions
- [x] Set up environment variables for Firebase

## Phase 3: Backend Migration (Deno to Node.js)
- [x] Convert journal-ai Edge Function to Node.js Cloud Function
- [x] Convert exposure-ladder Edge Function to Node.js Cloud Function
- [x] Convert reframe-forge Edge Function to Node.js Cloud Function
- [x] Set up CORS configuration for Cloud Functions
- [ ] Test all Cloud Functions locally

## Phase 4: Frontend Migration (Supabase to Firebase)
- [x] Replace Supabase client with Firebase SDK
- [x] Update AuthContext to use Firebase Authentication
- [x] Update all database queries to use Firestore
- [x] Update all service files (journalClient, exposureLadderClient, etc.)
- [x] Update environment variable references

## Phase 5: Database Schema Migration
- [x] Create Firestore security rules
- [x] Document Firestore collection structure
- [ ] Create data migration scripts (if needed)

## Phase 6: Testing & Validation
- [ ] Test authentication flows
- [ ] Test journal functionality
- [ ] Test exposure ladder functionality
- [ ] Test reframe forge functionality
- [ ] Verify all API calls work correctly

## Phase 7: Documentation & Deployment
- [x] Create comprehensive migration guide
- [x] Update README with Firebase setup instructions
- [x] Create deployment guide for Firebase
- [x] Document any breaking changes or differences