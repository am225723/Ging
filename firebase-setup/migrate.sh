#!/bin/bash

# Firebase Migration Helper Script
# This script helps automate parts of the Firebase migration process

set -e

echo "🔥 Firebase Migration Helper"
echo "============================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "ℹ $1"
}

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    print_error "Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi
print_success "Firebase CLI is installed"

# Check if logged in to Firebase
if ! firebase projects:list &> /dev/null; then
    print_error "Not logged in to Firebase"
    echo "Login with: firebase login"
    exit 1
fi
print_success "Logged in to Firebase"

echo ""
echo "Migration Steps:"
echo "1. Copy Firebase setup files"
echo "2. Install dependencies"
echo "3. Setup environment variables"
echo "4. Deploy Firestore rules and indexes"
echo "5. Deploy Cloud Functions"
echo ""

read -p "Do you want to proceed? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo ""
echo "Step 1: Copying Firebase setup files..."
echo "========================================"

# Copy Firebase configuration files
if [ -f "firebase-setup/firebase.json" ]; then
    cp firebase-setup/firebase.json .
    print_success "Copied firebase.json"
else
    print_warning "firebase.json not found in firebase-setup/"
fi

if [ -f "firebase-setup/firestore.rules" ]; then
    cp firebase-setup/firestore.rules .
    print_success "Copied firestore.rules"
fi

if [ -f "firebase-setup/firestore.indexes.json" ]; then
    cp firebase-setup/firestore.indexes.json .
    print_success "Copied firestore.indexes.json"
fi

# Copy functions directory
if [ -d "firebase-setup/functions" ]; then
    cp -r firebase-setup/functions .
    print_success "Copied functions directory"
fi

# Copy source files
if [ -d "firebase-setup/src" ]; then
    print_info "Copying source files..."
    
    # Create directories if they don't exist
    mkdir -p src/config
    mkdir -p src/contexts
    mkdir -p src/services
    
    # Copy files
    if [ -f "firebase-setup/src/config/firebase.js" ]; then
        cp firebase-setup/src/config/firebase.js src/config/
        print_success "Copied src/config/firebase.js"
    fi
    
    if [ -f "firebase-setup/src/contexts/AuthContext.jsx" ]; then
        cp firebase-setup/src/contexts/AuthContext.jsx src/contexts/
        print_success "Copied src/contexts/AuthContext.jsx"
    fi
    
    if [ -f "firebase-setup/src/services/firestoreClient.js" ]; then
        cp firebase-setup/src/services/firestoreClient.js src/services/
        print_success "Copied src/services/firestoreClient.js"
    fi
    
    if [ -f "firebase-setup/src/services/journalAiClient.js" ]; then
        cp firebase-setup/src/services/journalAiClient.js src/services/
        print_success "Copied src/services/journalAiClient.js"
    fi
    
    if [ -f "firebase-setup/src/services/exposureLadderClient.js" ]; then
        cp firebase-setup/src/services/exposureLadderClient.js src/services/
        print_success "Copied src/services/exposureLadderClient.js"
    fi
    
    if [ -f "firebase-setup/src/services/reframeForgeClient.js" ]; then
        cp firebase-setup/src/services/reframeForgeClient.js src/services/
        print_success "Copied src/services/reframeForgeClient.js"
    fi
fi

# Copy .env.example
if [ -f "firebase-setup/.env.example" ]; then
    if [ ! -f ".env" ]; then
        cp firebase-setup/.env.example .env
        print_success "Copied .env.example to .env"
        print_warning "Please update .env with your Firebase configuration!"
    else
        print_warning ".env already exists, skipping..."
    fi
fi

echo ""
echo "Step 2: Installing dependencies..."
echo "=================================="

# Install Firebase SDK
print_info "Installing Firebase SDK..."
npm install firebase
print_success "Firebase SDK installed"

# Install Cloud Functions dependencies
if [ -d "functions" ]; then
    print_info "Installing Cloud Functions dependencies..."
    cd functions
    npm install
    cd ..
    print_success "Cloud Functions dependencies installed"
fi

echo ""
echo "Step 3: Environment Variables Setup"
echo "===================================="
print_warning "You need to manually configure environment variables:"
echo ""
echo "1. Update .env file with your Firebase configuration"
echo "   - Get values from Firebase Console > Project Settings > General"
echo ""
echo "2. Set Gemini API key for Cloud Functions:"
echo "   firebase functions:config:set gemini.api_key=&quot;YOUR_GEMINI_API_KEY&quot;"
echo ""
echo "3. Create functions/.runtimeconfig.json for local development:"
echo '   {"gemini": {"api_key": "YOUR_GEMINI_API_KEY"}}'
echo ""

read -p "Have you configured the environment variables? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please configure environment variables before continuing"
    exit 1
fi

echo ""
echo "Step 4: Deploying Firestore Rules and Indexes"
echo "=============================================="

read -p "Deploy Firestore rules and indexes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying Firestore rules..."
    firebase deploy --only firestore:rules
    print_success "Firestore rules deployed"
    
    print_info "Deploying Firestore indexes..."
    firebase deploy --only firestore:indexes
    print_success "Firestore indexes deployed"
fi

echo ""
echo "Step 5: Deploying Cloud Functions"
echo "=================================="

read -p "Deploy Cloud Functions? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Deploying Cloud Functions..."
    firebase deploy --only functions
    print_success "Cloud Functions deployed"
fi

echo ""
echo "=========================================="
print_success "Migration helper completed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update your component files to use Firebase instead of Supabase"
echo "2. Test with Firebase Emulators: firebase emulators:start"
echo "3. Build and deploy: npm run build && firebase deploy --only hosting"
echo ""
echo "See QUICK_START.md for detailed instructions"
echo "See MIGRATION_CHECKLIST.md to track your progress"
echo ""