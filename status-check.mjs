#!/usr/bin/env node

/**
 * Quick Status Check - Ready to Deploy?
 */

import fs from 'fs';

console.log('🔍 AI Analysis Failed Fix - Status Check');
console.log('==========================================');

// Check if files exist and are properly updated
const checks = [
  {
    name: 'Edge Function - Reframe Forge',
    file: 'supabase/functions/reframe-forge/index.ts',
    check: (content) => content.includes('gemini-2.0-flash'),
    status: 'unknown'
  },
  {
    name: 'Edge Function - Journal AI',
    file: 'supabase/functions/journal-ai/index.ts',
    check: (content) => content.includes('gemini-2.0-flash'),
    status: 'unknown'
  },
  {
    name: 'Enhanced Reframe Client',
    file: 'src/services/reframeForgeClientEnhanced.js',
    check: (content) => content.includes('Enhanced version'),
    status: 'unknown'
  },
  {
    name: 'Enhanced Journal Client',
    file: 'src/services/journalAiClientEnhanced.js',
    check: (content) => content.includes('Enhanced version'),
    status: 'unknown'
  },
  {
    name: 'Debug Panel Component',
    file: 'src/components/debug/AIDebugPanel.jsx',
    check: (content) => content.includes('AIDebugPanel'),
    status: 'unknown'
  },
  {
    name: 'Test Script',
    file: 'test-ai-connection.mjs',
    check: (content) => content.includes('gemini-2.0-flash'),
    status: 'unknown'
  },
  {
    name: 'Troubleshooting Guide',
    file: 'AI_TROUBLESHOOTING_GUIDE.md',
    check: (content) => content.includes('ROOT CAUSE IDENTIFIED'),
    status: 'unknown'
  },
  {
    name: 'Deployment Guide',
    file: 'DEPLOYMENT_GUIDE.md',
    check: (content) => content.includes('MANUAL DEPLOYMENT STEPS'),
    status: 'unknown'
  }
];

let readyCount = 0;

checks.forEach((check, index) => {
  try {
    if (fs.existsSync(check.file)) {
      const content = fs.readFileSync(check.file, 'utf8');
      if (check.check(content)) {
        check.status = '✅ READY';
        readyCount++;
      } else {
        check.status = '❌ INVALID';
      }
    } else {
      check.status = '❌ MISSING';
    }
  } catch (error) {
    check.status = '❌ ERROR';
  }
  
  console.log(`${check.status} ${check.name}`);
});

console.log('\n📊 Summary');
console.log('===========');
console.log(`Ready: ${readyCount}/${checks.length} components`);

if (readyCount === checks.length) {
  console.log('🎉 ALL SYSTEMS READY!');
  console.log('Next steps:');
  console.log('1. Merge pull request: https://github.com/am225723/Ging/pull/14');
  console.log('2. Add GEMINI_API_KEY to Supabase environment variables');
  console.log('3. Deploy edge functions');
  console.log('4. Test with: node test-ai-connection.mjs');
} else {
  console.log('⚠️ Some components are not ready');
  console.log('Please review the failed items above');
}

console.log('\n🚀 Ready to deploy? Run: node test-ai-connection.mjs');