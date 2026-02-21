#!/bin/bash
# Quick Deployment Script for Security Fixes
# Run this script to deploy all security updates

set -e  # Exit on any error

echo "🚀 Deploying Security Fixes for Waiver System"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Verify we're in the right directory
echo -e "${BLUE}Step 1: Verifying directory...${NC}"
if [ ! -f "firebase.json" ]; then
    echo -e "${RED}Error: firebase.json not found. Please run this script from the project root.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Directory verified${NC}"
echo ""

# Step 2: Check if Firebase CLI is installed
echo -e "${BLUE}Step 2: Checking Firebase CLI...${NC}"
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}Error: Firebase CLI not found. Please install it:${NC}"
    echo "  npm install -g firebase-tools"
    exit 1
fi
echo -e "${GREEN}✓ Firebase CLI found${NC}"
echo ""

# Step 3: Check if logged in to Firebase
echo -e "${BLUE}Step 3: Checking Firebase authentication...${NC}"
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}You are not logged in to Firebase.${NC}"
    echo "Please run: firebase login"
    exit 1
fi
echo -e "${GREEN}✓ Authenticated with Firebase${NC}"
echo ""

# Step 4: Build Cloud Functions
echo -e "${BLUE}Step 4: Building Cloud Functions...${NC}"
cd functions
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Cloud Functions build failed${NC}"
    exit 1
fi
cd ..
echo -e "${GREEN}✓ Cloud Functions built successfully${NC}"
echo ""

# Step 5: Deploy Firestore and Storage Rules FIRST
echo -e "${BLUE}Step 5: Deploying Security Rules...${NC}"
echo -e "${YELLOW}⚠️  The new rules are more restrictive. Ensure admin emails are configured correctly!${NC}"
echo ""
read -p "Deploy Firestore and Storage rules? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase deploy --only firestore:rules,storage
    echo -e "${GREEN}✓ Security rules deployed${NC}"
else
    echo -e "${YELLOW}Skipped security rules deployment${NC}"
fi
echo ""

# Step 6: Deploy Cloud Functions
echo -e "${BLUE}Step 6: Deploying Cloud Functions...${NC}"
echo "This includes:"
echo "  - Rate limiting (100 requests/minute)"
echo "  - App Check enforcement (configurable)"
echo "  - PDF size limits (10MB max)"
echo "  - expiresAt field in new waivers"
echo ""
read -p "Deploy Cloud Functions? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    firebase deploy --only functions
    echo -e "${GREEN}✓ Cloud Functions deployed${NC}"
else
    echo -e "${YELLOW}Skipped Cloud Functions deployment${NC}"
fi
echo ""

# Step 7: Deploy Frontend Apps (optional)
echo -e "${BLUE}Step 7: Deploy Frontend Apps (Optional)${NC}"
echo "This will build and deploy all 4 apps:"
echo "  - waivers-app (public waiver form)"
echo "  - valid-waivers (waiver search)"
echo "  - paper-waiver-upload (paper waiver scanner)"
echo "  - waivers-admin (admin console)"
echo ""
read -p "Deploy frontend apps? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Building and deploying all apps..."
    firebase deploy --only hosting
    echo -e "${GREEN}✓ Frontend apps deployed${NC}"
else
    echo -e "${YELLOW}Skipped frontend deployment${NC}"
fi
echo ""

# Done!
echo "=============================================="
echo -e "${GREEN}🎉 Deployment Complete!${NC}"
echo "=============================================="
echo ""
echo "Next Steps:"
echo "1. Set up admin users:"
echo "   cd scripts && npm install && npm run setup:admin your-email@example.com"
echo ""
echo "2. Run migration script (if you have existing waivers):"
echo "   cd scripts && npm run migrate:expires-at"
echo ""
echo "3. Test the deployment:"
echo "   - Submit a new waiver"
echo "   - Try to update/delete (should fail)"
echo "   - Test rate limiting (submit 101 rapidly)"
echo "   - Verify admin console access"
echo ""
echo "4. Check logs:"
echo "   firebase functions:log"
echo ""
echo "See SECURITY_DEPLOYMENT.md for detailed testing checklist."
echo ""
