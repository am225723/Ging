# Complete Migration Guide: Supabase to Firebase & Deno to Node.js

This guide provides a comprehensive, step-by-step process to migrate your application from Supabase to Firebase and convert Deno Edge Functions to Node.js Cloud Functions.

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Firebase Project Setup](#phase-1-firebase-project-setup)
4. [Phase 2: Database Schema Migration](#phase-2-database-schema-migration)
5. [Phase 3: Backend Migration (Deno to Node.js)](#phase-3-backend-migration-deno-to-nodejs)
6. [Phase 4: Frontend Migration](#phase-4-frontend-migration)
7. [Phase 5: Testing & Deployment](#phase-5-testing--deployment)
8. [Common Issues & Solutions](#common-issues--solutions)

---

## Overview

### Current Architecture
- **Frontend**: React with Vite
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **AI Integration**: Google Gemini API

### Target Architecture
- **Frontend**: React with Vite (unchanged)
- **Backend**: Firebase Cloud Functions (Node.js runtime)
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **AI Integration**: Google Gemini API (unchanged)

### Key Differences

| Feature | Supabase | Firebase |
|---------|----------|----------|
| Database | PostgreSQL (relational) | Firestore (NoSQL) |
| Runtime | Deno | Node.js |
| Auth | Supabase Auth | Firebase Auth |
| Functions | Edge Functions | Cloud Functions |
| Queries | SQL-like | Document-based |

---

## Prerequisites

### Required Tools
```bash
# Install Node.js (v18 or higher)
node --version

# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login
```

### Required Accounts
- Google Cloud Platform account
- Firebase project (we'll create this)
- Gemini API key (you already have this)

---

## Phase 1: Firebase Project Setup

### Step 1.1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "ging-app")
4. Enable Google Analytics (optional)
5. Create project

### Step 1.2: Enable Required Services

In your Firebase project:

1. **Authentication**:
   - Go to Authentication → Get Started
   - Enable Email/Password provider
   - Configure settings as needed

2. **Firestore Database**:
   - Go to Firestore Database → Create Database
   - Start in **production mode** (we'll add security rules later)
   - Choose a location (e.g., us-central1)

3. **Cloud Functions**:
   - Go to Functions → Get Started
   - This will be configured via CLI

### Step 1.3: Initialize Firebase in Your Project

```bash
cd Ging

# Initialize Firebase (select Functions, Firestore, and Hosting)
firebase init

# When prompted:
# - Select: Functions, Firestore, Hosting
# - Use existing project (select your project)
# - Language: JavaScript
# - ESLint: Yes
# - Install dependencies: Yes
# - Firestore rules: Use default
# - Public directory: dist
# - Single-page app: Yes
# - GitHub deploys: No (optional)
```

This creates:
- `firebase.json` - Firebase configuration
- `firestore.rules` - Database security rules
- `firestore.indexes.json` - Database indexes
- `functions/` - Cloud Functions directory

### Step 1.4: Install Firebase SDK in Frontend

```bash
npm install firebase
```

### Step 1.5: Create Firebase Configuration File

Create `src/config/firebase.js`:

```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app);

export default app;
```

### Step 1.6: Update Environment Variables

Create/update `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Gemini API (unchanged)
VITE_GEMINI_API_KEY=your_gemini_api_key
```

To get these values:
1. Go to Firebase Console → Project Settings → General
2. Scroll to "Your apps" section
3. Click "Add app" → Web
4. Register app and copy the config values

---

## Phase 2: Database Schema Migration

### Step 2.1: Understanding the Differences

**Supabase (PostgreSQL)**:
- Tables with rows and columns
- SQL queries
- Foreign keys and joins
- Row Level Security (RLS)

**Firestore (NoSQL)**:
- Collections with documents
- Document queries
- Subcollections and references
- Security Rules

### Step 2.2: Firestore Collections Structure

Here's how we'll map the Supabase tables to Firestore collections:

#### Collection: `users`
```javascript
// Document ID: user.uid
{
  email: string,
  createdAt: timestamp,
  lastLogin: timestamp
}
```

#### Collection: `journal_entries`
```javascript
// Document ID: auto-generated
{
  userId: string,           // Reference to user
  createdAt: timestamp,
  title: string,
  content: string,
  mood: number,            // 0-100
  tags: array,
  aiInsights: object,      // JSON object
  aiSummary: string,
  aiActions: object        // JSON object
}
```

#### Collection: `exposure_ladders`
```javascript
// Document ID: auto-generated
{
  userId: string,
  createdAt: timestamp,
  fearTitle: string,
  goal: string,
  constraints: string,
  steps: array,            // Array of step objects
  aiNotes: string,
  safetyNote: string,
  completedSteps: number
}
```

#### Collection: `reframes`
```javascript
// Document ID: auto-generated
{
  userId: string,
  createdAt: timestamp,
  negativeThought: string,
  context: string,
  cognitiveDistortions: array,
  reframedThought: string,
  aiAnalysis: object       // Full AI response
}
```

### Step 2.3: Create Firestore Security Rules

Update `firestore.rules`:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Users collection
    match /users/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    // Journal entries
    match /journal_entries/{entryId} {
      allow read, write: if isAuthenticated() && 
                            resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
    }
    
    // Exposure ladders
    match /exposure_ladders/{ladderId} {
      allow read, write: if isAuthenticated() && 
                            resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
    }
    
    // Reframes
    match /reframes/{reframeId} {
      allow read, write: if isAuthenticated() && 
                            resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated() && 
                       request.resource.data.userId == request.auth.uid;
    }
  }
}
```

Deploy security rules:
```bash
firebase deploy --only firestore:rules
```

### Step 2.4: Create Firestore Indexes

Update `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "journal_entries",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "exposure_ladders",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "reframes",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

---

## Phase 3: Backend Migration (Deno to Node.js)

### Step 3.1: Set Up Cloud Functions Project

```bash
cd functions

# Install required dependencies
npm install firebase-admin firebase-functions cors
npm install --save-dev @types/node
```

Update `functions/package.json`:

```json
{
  "name": "functions",
  "description": "Cloud Functions for Firebase",
  "scripts": {
    "serve": "firebase emulators:start --only functions",
    "shell": "firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^5.0.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/node": "^20.0.0"
  }
}
```

### Step 3.2: Create Shared Utilities

Create `functions/utils/cors.js`:

```javascript
const cors = require('cors')({
  origin: true,
  credentials: true
});

module.exports = cors;
```

Create `functions/utils/auth.js`:

```javascript
const admin = require('firebase-admin');

/**
 * Verify Firebase ID token from request
 */
async function verifyAuth(req) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Unauthorized: No token provided');
  }
  
  const token = authHeader.split('Bearer ')[1];
  
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    return decodedToken;
  } catch (error) {
    throw new Error('Unauthorized: Invalid token');
  }
}

module.exports = { verifyAuth };
```

Create `functions/utils/gemini.js`:

```javascript
/**
 * Call Gemini API with JSON response configuration
 */
async function callGeminiAPI(prompt, apiKey) {
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })
  });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API failed: ${response.status} - ${errorBody}`);
  }
  
  const data = await response.json();
  
  if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
    throw new Error('Invalid response structure from Gemini API');
  }
  
  return data.candidates[0].content.parts[0].text;
}

/**
 * Parse JSON response from Gemini
 */
function parseGeminiResponse(rawText) {
  try {
    let cleanedText = rawText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '');
    cleanedText = cleanedText.replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();
    
    const parsed = JSON.parse(cleanedText);
    
    if (typeof parsed !== 'object' || parsed === null) {
      throw new Error('Response is not a valid JSON object');
    }
    
    return parsed;
  } catch (error) {
    console.error('JSON Parse Error:', error);
    console.error('Raw text:', rawText);
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
}

module.exports = { callGeminiAPI, parseGeminiResponse };
```

### Step 3.3: Convert journal-ai Function

Create `functions/journal-ai.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('./utils/cors');
const { verifyAuth } = require('./utils/auth');
const { callGeminiAPI, parseGeminiResponse } = require('./utils/gemini');

const GEMINI_API_KEY = functions.config().gemini.api_key;

function getPrompt(mode, journalData) {
  const basePrompt = `
    You are a compassionate and insightful AI journaling assistant.
    Analyze the following journal entry:
    - Title: "${journalData.title || 'Untitled'}"
    - Content: "${journalData.content}"
    - Mood Rating (0-100): ${journalData.mood}
    - Tags: ${journalData.tags?.length > 0 ? journalData.tags.join(', ') : 'None'}
  `;

  switch (mode) {
    case 'summarize':
      return `${basePrompt}

Please provide a concise, one-paragraph summary of the main themes and emotions in this entry.

Return your response as a JSON object with this exact structure:
{
  "summary": "Your one-paragraph summary here"
}`;

    case 'insights':
      return `${basePrompt}

Identify 3-5 key emotional themes, cognitive patterns, or recurring thoughts in this entry. 
Present them as clear, actionable insights.

Return your response as a JSON object with this exact structure:
{
  "insights": "• First insight\\n• Second insight\\n• Third insight"
}`;

    case 'actions':
      return `${basePrompt}

Based on this journal entry, suggest 2-3 small, concrete, actionable steps the user could take.
These should be specific and achievable within the next 24-48 hours.

Return your response as a JSON object with this exact structure:
{
  "actions": "1. First action step\\n2. Second action step\\n3. Third action step"
}`;

    case 'ask':
      return `${basePrompt}

The user has asked the following question about their entry:
"${journalData.question}"

Answer their question based on the content of their journal entry. Be supportive and insightful.

Return your response as a JSON object with this exact structure:
{
  "answer": "Your answer to their question here"
}`;

    case 'rewrite':
      return `${basePrompt}

Rewrite this journal entry in a "${journalData.tone}" tone while preserving the core meaning and emotions.
Keep the same general length and structure.

Return your response as a JSON object with this exact structure:
{
  "rewrite": "The rewritten journal entry here"
}`;

    default:
      throw new Error(`Invalid mode: ${mode}`);
  }
}

exports.journalAi = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      // Parse request body
      const { mode, journalData } = req.body;

      // Validate input
      if (!journalData?.content) {
        return res.status(400).json({ error: 'Missing journal content' });
      }

      if (!mode) {
        return res.status(400).json({ error: 'Missing mode parameter' });
      }

      // Generate prompt
      const prompt = getPrompt(mode, journalData);

      // Call Gemini API
      const rawText = await callGeminiAPI(prompt, GEMINI_API_KEY);
      const aiResult = parseGeminiResponse(rawText);

      // Validate response has expected key
      const expectedKeys = {
        'summarize': 'summary',
        'insights': 'insights',
        'actions': 'actions',
        'ask': 'answer',
        'rewrite': 'rewrite'
      };

      const expectedKey = expectedKeys[mode];
      if (expectedKey && !aiResult[expectedKey]) {
        throw new Error(`AI response missing expected key: ${expectedKey}`);
      }

      // Return AI result
      return res.status(200).json(aiResult);

    } catch (error) {
      console.error('Journal AI Error:', error);
      
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: error.message || 'An unexpected error occurred' 
      });
    }
  });
});
```

### Step 3.4: Convert exposure-ladder Function

Create `functions/exposure-ladder.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('./utils/cors');
const { verifyAuth } = require('./utils/auth');
const { callGeminiAPI, parseGeminiResponse } = require('./utils/gemini');

const GEMINI_API_KEY = functions.config().gemini.api_key;
const db = admin.firestore();

function getPrompt(fear, goal, constraints) {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT) and exposure therapy. Create a structured exposure ladder to help someone gradually face their fear.

**User's Fear:** "${fear}"
**User's Goal:** "${goal || 'Not specified'}"
**Constraints/Context:** "${constraints || 'Not specified'}"

**Instructions:**
Create an exposure ladder with 5-8 steps that gradually increase in difficulty. Each step should be:
- Specific and actionable
- Measurable (with clear success criteria)
- Ordered from least to most anxiety-provoking
- Realistic and achievable

**Return your response as a JSON object with this exact structure:**
{
  "ladder": [
    {
      "title": "Brief, clear title for this step (e.g., 'Look at pictures of dogs')",
      "description": "Detailed description of what to do in this step",
      "anxietyLevel": 2,
      "suds_target": 1,
      "prep": "How to prepare for this step (e.g., 'Find a comfortable, safe space')",
      "duration": 10,
      "success": "Clear criteria for success (e.g., 'Can look at pictures for 5 minutes without leaving')"
    }
  ],
  "notes": "General guidance and encouragement for the user as they work through this ladder. Include tips for managing anxiety and when to move to the next step.",
  "safety_note": "If this fear involves potential danger, self-harm, or requires professional supervision, include a safety warning here. Otherwise, set to null."
}

**Important Guidelines:**
- anxietyLevel: Rate from 1-10 (1=minimal anxiety, 10=extreme anxiety)
- suds_target: The target anxiety level after practicing this step (usually 1-2 points lower)
- duration: Suggested time in minutes to practice this step
- Order steps from lowest to highest anxietyLevel
- Make sure there's a gradual progression (don't jump from 2 to 8)
- Include 5-8 steps total
- Be compassionate and encouraging in your notes

**Return ONLY the JSON object, no additional text or markdown formatting.**
`;
}

function mapStepsToFormat(aiSteps) {
  return aiSteps.map((step, index) => ({
    id: index + 1,
    title: step.title || `Step ${index + 1}`,
    description: step.description || step.action || '',
    anxietyLevel: step.anxietyLevel || step.suds_start || 5,
    suds_target: step.suds_target || Math.max(1, (step.anxietyLevel || 5) - 2),
    prep: step.prep || '',
    duration: step.duration || step.duration_min || 10,
    success: step.success || step.success_criteria || '',
    completed: false
  }));
}

exports.exposureLadder = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      // Parse request body
      const { fear_title, goal, constraints } = req.body;

      // Validate input
      if (!fear_title || fear_title.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or empty fear_title' });
      }

      // Generate prompt
      const prompt = getPrompt(fear_title, goal, constraints);

      // Call Gemini API
      const rawText = await callGeminiAPI(prompt, GEMINI_API_KEY);
      const aiResult = parseGeminiResponse(rawText);

      // Validate structure
      if (!aiResult.ladder || !Array.isArray(aiResult.ladder)) {
        throw new Error('Missing or invalid ladder array');
      }

      // Map steps to frontend format
      const mappedSteps = mapStepsToFormat(aiResult.ladder);

      // Sort by anxiety level
      mappedSteps.sort((a, b) => a.anxietyLevel - b.anxietyLevel);

      // Save to Firestore
      const ladderData = {
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        fearTitle: fear_title,
        goal: goal || null,
        constraints: constraints || null,
        steps: mappedSteps,
        aiNotes: aiResult.notes || null,
        safetyNote: aiResult.safety_note || null,
        completedSteps: 0
      };

      const docRef = await db.collection('exposure_ladders').add(ladderData);
      const doc = await docRef.get();

      // Return the full document
      return res.status(201).json({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      console.error('Exposure Ladder Error:', error);
      
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: error.message || 'An unexpected error occurred' 
      });
    }
  });
});
```

### Step 3.5: Convert reframe-forge Function

Create `functions/reframe-forge.js`:

```javascript
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('./utils/cors');
const { verifyAuth } = require('./utils/auth');
const { callGeminiAPI, parseGeminiResponse } = require('./utils/gemini');

const GEMINI_API_KEY = functions.config().gemini.api_key;
const db = admin.firestore();

function getPrompt(negativeThought, context) {
  return `
You are an expert in Cognitive Behavioral Therapy (CBT). Analyze the following negative thought and its context, then provide a detailed analysis.

**Negative Thought:** "${negativeThought}"
**Context:** "${context || 'No additional context provided.'}"

**Instructions:**
1. **Identify Cognitive Distortions:** List the cognitive distortions present (e.g., "All-or-Nothing Thinking", "Catastrophizing", "Overgeneralization", "Mental Filter", "Discounting the Positive", "Jumping to Conclusions").

2. **Challenge the Thought:** 
   - Provide 2-4 pieces of evidence that support the negative thought
   - Provide 2-4 pieces of evidence that contradict the negative thought

3. **Create a Balanced Reframe:** Write a more balanced, realistic, and compassionate alternative thought that acknowledges both perspectives.

4. **Suggest a Tiny Action:** Propose one small, concrete action the user can take right now (within the next hour) to test or challenge this thought.

5. **Add a Safety Note:** If the thought involves self-harm, suicidal ideation, crisis, or abuse, include a safety note advising professional help. Otherwise, set this to null.

**Return your response as a JSON object with this exact structure:**
{
  "distortions": ["Distortion 1", "Distortion 2"],
  "evidence_for": ["Evidence supporting the thought 1", "Evidence 2"],
  "evidence_against": ["Evidence contradicting the thought 1", "Evidence 2"],
  "balanced_reframe": "A balanced, compassionate alternative thought that acknowledges reality while being more helpful.",
  "tiny_action": "A specific, small action the user can take right now.",
  "safety_note": "A safety note if needed, or null"
}

**Important:** Return ONLY the JSON object, no additional text or markdown formatting.
`;
}

exports.reframeForge = functions.https.onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      // Verify authentication
      const decodedToken = await verifyAuth(req);
      const userId = decodedToken.uid;

      // Parse request body
      const { negative_thought, context } = req.body;

      // Validate input
      if (!negative_thought || negative_thought.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or empty negative_thought' });
      }

      // Generate prompt
      const prompt = getPrompt(negative_thought, context);

      // Call Gemini API
      const rawText = await callGeminiAPI(prompt, GEMINI_API_KEY);
      const aiAnalysis = parseGeminiResponse(rawText);

      // Validate required fields
      const requiredFields = ['distortions', 'evidence_for', 'evidence_against', 'balanced_reframe', 'tiny_action'];
      for (const field of requiredFields) {
        if (!(field in aiAnalysis)) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Save to Firestore
      const reframeData = {
        userId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        negativeThought: negative_thought,
        context: context || null,
        cognitiveDistortions: aiAnalysis.distortions,
        reframedThought: aiAnalysis.balanced_reframe,
        aiAnalysis
      };

      const docRef = await db.collection('reframes').add(reframeData);
      const doc = await docRef.get();

      // Return the full document
      return res.status(201).json({
        id: doc.id,
        ...doc.data()
      });

    } catch (error) {
      console.error('Reframe Forge Error:', error);
      
      if (error.message.includes('Unauthorized')) {
        return res.status(401).json({ error: error.message });
      }
      
      return res.status(500).json({ 
        error: error.message || 'An unexpected error occurred' 
      });
    }
  });
});
```

### Step 3.6: Create Main Index File

Update `functions/index.js`:

```javascript
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
exports.journalAi = require('./journal-ai').journalAi;
exports.exposureLadder = require('./exposure-ladder').exposureLadder;
exports.reframeForge = require('./reframe-forge').reframeForge;
```

### Step 3.7: Configure Environment Variables

Set the Gemini API key:

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

**Important**: Add this file to `.gitignore`!

---

## Phase 4: Frontend Migration

### Step 4.1: Update AuthContext

Replace `src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useState, useEffect, useContext } from 'react';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from '../config/firebase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  const signUp = async ({ email, password }) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { data: { user: result.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signIn = async ({ email, password }) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { data: { user: result.user }, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    signUp,
    signIn,
    signOut,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
```

### Step 4.2: Create Firestore Client

Create `src/services/firestoreClient.js`:

```javascript
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Generic Firestore operations
 */

// Get a single document
export async function getDocument(collectionName, docId) {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    } else {
      return { data: null, error: new Error('Document not found') };
    }
  } catch (error) {
    return { data: null, error };
  }
}

// Get all documents for a user
export async function getUserDocuments(collectionName, userId, orderByField = 'createdAt', orderDirection = 'desc') {
  try {
    const q = query(
      collection(db, collectionName),
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection)
    );
    
    const querySnapshot = await getDocs(q);
    const documents = [];
    
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    
    return { data: documents, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Create a new document
export async function createDocument(collectionName, data) {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    
    const docSnap = await getDoc(docRef);
    return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Update a document
export async function updateDocument(collectionName, docId, data) {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, data);
    
    const docSnap = await getDoc(docRef);
    return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
  } catch (error) {
    return { data: null, error };
  }
}

// Delete a document
export async function deleteDocument(collectionName, docId) {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { error: null };
  } catch (error) {
    return { error };
  }
}
```

### Step 4.3: Update Journal AI Client

Replace `src/services/journalAiClient.js`:

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Available modes for the Journal AI service
 */
export const JOURNAL_AI_MODES = {
  SUMMARIZE: 'summarize',
  INSIGHTS: 'insights',
  ACTIONS: 'actions',
  REWRITE: 'rewrite',
  ASK: 'ask'
};

/**
 * Process a journal entry by calling the Firebase Cloud Function
 */
export async function processJournalEntry(mode, journalData, entry = null) {
  if (!journalData || !journalData.content) {
    return { error: 'Journal content is required.' };
  }

  try {
    const journalAi = httpsCallable(functions, 'journalAi');
    const result = await journalAi({
      mode,
      journalData,
      entry
    });

    return result.data;
  } catch (error) {
    console.error(`Error in journal AI service (mode: ${mode}):`, error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
```

### Step 4.4: Update Exposure Ladder Client

Replace `src/services/exposureLadderClient.js`:

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Generate an exposure ladder by calling the Firebase Cloud Function
 */
export async function generateExposureLadder(fear, goal = '', constraints = '') {
  if (!fear) {
    return { error: 'A fear is required to generate a ladder.' };
  }

  try {
    const exposureLadder = httpsCallable(functions, 'exposureLadder');
    const result = await exposureLadder({
      fear_title: fear,
      goal,
      constraints
    });

    return result.data;
  } catch (error) {
    console.error('Error in exposure ladder service:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
```

### Step 4.5: Update Reframe Forge Client

Replace `src/services/reframeForgeClient.js`:

```javascript
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';

/**
 * Generate a cognitive reframe by calling the Firebase Cloud Function
 */
export async function generateReframe(negativeThought, context = '') {
  if (!negativeThought) {
    return { error: 'A negative thought is required.' };
  }

  try {
    const reframeForge = httpsCallable(functions, 'reframeForge');
    const result = await reframeForge({
      negative_thought: negativeThought,
      context
    });

    return result.data;
  } catch (error) {
    console.error('Error in reframe forge service:', error);
    return { error: error.message || 'An unexpected error occurred.' };
  }
}
```

### Step 4.6: Update Journal Page

You'll need to update `src/pages/Journal.jsx` to use Firestore instead of Supabase. Here's an example of the key changes:

```javascript
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserDocuments, 
  createDocument, 
  updateDocument, 
  deleteDocument 
} from '../services/firestoreClient';
import { processJournalEntry, JOURNAL_AI_MODES } from '../services/journalAiClient';

// In your component:
const { user } = useAuth();

// Fetch entries
useEffect(() => {
  const fetchEntries = async () => {
    if (user) {
      const { data, error } = await getUserDocuments('journal_entries', user.uid);
      if (error) {
        console.error('Error fetching entries:', error);
      } else {
        setEntries(data);
      }
    }
  };
  fetchEntries();
}, [user]);

// Create entry
const handleSaveEntry = async (entryData) => {
  const { data, error } = await createDocument('journal_entries', {
    userId: user.uid,
    title: entryData.title,
    content: entryData.content,
    mood: entryData.mood,
    tags: entryData.tags || []
  });
  
  if (error) {
    console.error('Error saving entry:', error);
  } else {
    setEntries([data, ...entries]);
  }
};

// Update entry
const handleUpdateEntry = async (entryId, updates) => {
  const { data, error } = await updateDocument('journal_entries', entryId, updates);
  
  if (error) {
    console.error('Error updating entry:', error);
  } else {
    setEntries(entries.map(e => e.id === entryId ? data : e));
  }
};

// Delete entry
const handleDeleteEntry = async (entryId) => {
  const { error } = await deleteDocument('journal_entries', entryId);
  
  if (error) {
    console.error('Error deleting entry:', error);
  } else {
    setEntries(entries.filter(e => e.id !== entryId));
  }
};

// AI processing remains the same
const handleAIProcess = async (mode, journalData) => {
  const result = await processJournalEntry(mode, journalData);
  // Handle result...
};
```

### Step 4.7: Update Package.json

Update `package.json` to remove Supabase and add Firebase:

```json
{
  "dependencies": {
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.1",
    "@google/generative-ai": "0.24.1",
    "@mui/icons-material": "^7.3.2",
    "@mui/material": "^7.3.2",
    "@react-three/drei": "^10.7.6",
    "@react-three/fiber": "^9.3.0",
    "axios": "^1.12.2",
    "firebase": "^10.7.1",
    "framer-motion": "^12.23.22",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.9.3",
    "recharts": "3.2.1",
    "styled-components": "^6.1.19",
    "three": "^0.180.0"
  }
}
```

Remove Supabase:
```bash
npm uninstall @supabase/supabase-js
npm install firebase
```

---

## Phase 5: Testing & Deployment

### Step 5.1: Test Locally with Emulators

```bash
# Install emulators
firebase init emulators

# Select: Authentication, Functions, Firestore

# Start emulators
firebase emulators:start
```

Update your Firebase config for local testing:

```javascript
// src/config/firebase.js
import { connectAuthEmulator } from 'firebase/auth';
import { connectFirestoreEmulator } from 'firebase/firestore';
import { connectFunctionsEmulator } from 'firebase/functions';

// ... existing config ...

// Connect to emulators in development
if (import.meta.env.DEV) {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Step 5.2: Test Each Feature

1. **Authentication**:
   - Sign up new user
   - Sign in existing user
   - Sign out
   - Protected routes

2. **Journal**:
   - Create entry
   - Read entries
   - Update entry
   - Delete entry
   - AI processing (all modes)

3. **Exposure Ladder**:
   - Generate ladder
   - View ladders
   - Update step completion
   - Delete ladder

4. **Reframe Forge**:
   - Generate reframe
   - View reframes
   - Delete reframe

### Step 5.3: Deploy to Firebase

```bash
# Deploy everything
firebase deploy

# Or deploy specific services
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only hosting
```

### Step 5.4: Update Environment Variables for Production

In your hosting environment, set:

```env
VITE_FIREBASE_API_KEY=your_production_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## Common Issues & Solutions

### Issue 1: CORS Errors

**Problem**: Getting CORS errors when calling Cloud Functions

**Solution**: 
- Ensure `cors` is properly configured in each function
- Check that your frontend URL is allowed in Firebase Console → Functions → Settings
- For local development, make sure emulators are running

### Issue 2: Authentication Token Not Sent

**Problem**: Functions return 401 Unauthorized

**Solution**:
```javascript
// Make sure to get the ID token
const user = auth.currentUser;
if (user) {
  const token = await user.getIdToken();
  // Pass token in Authorization header
}
```

Firebase SDK handles this automatically with `httpsCallable`.

### Issue 3: Timestamp Conversion

**Problem**: Firestore timestamps don't match Supabase format

**Solution**:
```javascript
// Convert Firestore timestamp to JavaScript Date
const createdAt = doc.data().createdAt?.toDate();

// Or use in queries
import { Timestamp } from 'firebase/firestore';
const timestamp = Timestamp.fromDate(new Date());
```

### Issue 4: Array Queries

**Problem**: Querying arrays in Firestore is different from PostgreSQL

**Solution**:
```javascript
// Use array-contains for single value
query(collection(db, 'journal_entries'), 
  where('tags', 'array-contains', 'anxiety')
);

// Use array-contains-any for multiple values
query(collection(db, 'journal_entries'),
  where('tags', 'array-contains-any', ['anxiety', 'stress'])
);
```

### Issue 5: Missing Indexes

**Problem**: Queries fail with "requires an index" error

**Solution**:
- Click the link in the error message to create the index automatically
- Or manually add to `firestore.indexes.json` and deploy

### Issue 6: Function Timeout

**Problem**: Cloud Functions timeout after 60 seconds

**Solution**:
```javascript
// Increase timeout in function definition
exports.myFunction = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onRequest(async (req, res) => {
    // ...
  });
```

### Issue 7: Cold Start Performance

**Problem**: First function call is slow

**Solution**:
- Use minimum instances (paid feature):
```javascript
exports.myFunction = functions
  .runWith({ minInstances: 1 })
  .https.onRequest(async (req, res) => {
    // ...
  });
```

---

## Data Migration (Optional)

If you have existing data in Supabase that you want to migrate:

### Step 1: Export from Supabase

```javascript
// export-supabase-data.js
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function exportData() {
  // Export journal entries
  const { data: journals } = await supabase
    .from('journal_entries')
    .select('*');
  
  fs.writeFileSync('journals.json', JSON.stringify(journals, null, 2));
  
  // Export exposure ladders
  const { data: ladders } = await supabase
    .from('exposure_ladders')
    .select('*');
  
  fs.writeFileSync('ladders.json', JSON.stringify(ladders, null, 2));
  
  // Export reframes
  const { data: reframes } = await supabase
    .from('reframes')
    .select('*');
  
  fs.writeFileSync('reframes.json', JSON.stringify(reframes, null, 2));
}

exportData();
```

### Step 2: Import to Firestore

```javascript
// import-to-firestore.js
const admin = require('firebase-admin');
const fs = require('fs');

admin.initializeApp();
const db = admin.firestore();

async function importData() {
  // Import journals
  const journals = JSON.parse(fs.readFileSync('journals.json'));
  const batch = db.batch();
  
  journals.forEach(journal => {
    const docRef = db.collection('journal_entries').doc();
    batch.set(docRef, {
      userId: journal.user_id,
      createdAt: admin.firestore.Timestamp.fromDate(new Date(journal.created_at)),
      title: journal.title,
      content: journal.content,
      mood: journal.mood,
      tags: journal.tags || [],
      aiInsights: journal.ai_insights,
      aiSummary: journal.ai_summary,
      aiActions: journal.ai_actions
    });
  });
  
  await batch.commit();
  console.log('Journals imported');
  
  // Repeat for other collections...
}

importData();
```

---

## Next Steps

After completing the migration:

1. **Remove Supabase Code**:
   - Delete `supabase/` directory
   - Remove Supabase environment variables
   - Delete `src/services/supabaseClient.js`

2. **Update Documentation**:
   - Update README.md with Firebase setup instructions
   - Document new environment variables
   - Update deployment guide

3. **Monitor Performance**:
   - Check Firebase Console for function logs
   - Monitor Firestore usage
   - Set up billing alerts

4. **Optimize**:
   - Add Firestore indexes as needed
   - Optimize function cold starts
   - Implement caching where appropriate

---

## Summary

You've successfully migrated from:
- ✅ Supabase PostgreSQL → Firebase Firestore
- ✅ Supabase Auth → Firebase Authentication
- ✅ Deno Edge Functions → Node.js Cloud Functions
- ✅ Supabase Client SDK → Firebase SDK

Your application now runs entirely on Firebase infrastructure with Node.js backend functions!