#!/usr/bin/env node

/**
 * Simple AI Connection Test Script
 * Tests Gemini API and provides diagnostic information
 */

console.log('🧪 AI Connection Test Script');
console.log('============================');

const GEMINI_API_KEY = 'AIzaSyARhDWIEFUjS8pYXK_g3vocsWmnwkRp93A';
const SUPABASE_URL = 'https://tyfwgbmtbgzjzjejgkzb.supabase.co';

async function testGeminiApiKey() {
  console.log('\n🔄 Testing Gemini API Key...');
  
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Hello, this is a test message.' }] }]
      })
    });

    const data = await response.json();
    
    if (response.ok && data.candidates) {
      console.log('✅ Gemini API Key is VALID and working');
      console.log('✅ Response received:', data.candidates[0].content.parts[0].text.substring(0, 50) + '...');
      return true;
    } else {
      console.log('❌ Gemini API Key is INVALID or expired');
      console.log('❌ Response status:', response.status, response.statusText);
      if (data.error) {
        console.log('❌ Error details:', data.error);
      }
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing Gemini API:', error.message);
    return false;
  }
}

async function testSupabaseUrl() {
  console.log('\n🔄 Testing Supabase URL...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      method: 'GET',
      headers: { 
        'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZndnYm10Ymd6anpqZWpna3piIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg5OTA0OTMsImV4cCI6MjA3NDU2NjQ5M30.hVHjBjf7aIF7Bm9Pba8SwbEovHhC3xvpOlgP9qhd4jU'
      }
    });

    if (response.ok || response.status === 400) {
      console.log('✅ Supabase URL is reachable');
      return true;
    } else {
      console.log('❌ Supabase URL test failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.log('❌ Error testing Supabase URL:', error.message);
    return false;
  }
}

function provideCurlCommands() {
  console.log('\n🔧 Manual Testing with curl commands:');
  console.log('=====================================');
  
  console.log('\n1. Test Gemini API Key:');
  console.log(`curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}" \\
  -H "Content-Type: application/json" \\
  -d '{"contents":[{"parts":[{"text":"Hello, test"}]}]}'`);
  
  console.log('\n2. Test Supabase Edge Function (requires auth token):');
  console.log(`# First, get your auth token from the browser console:`);
  console.log(`# supabase.auth.getSession().then(({ data }) => console.log(data.session.access_token))`);
  console.log('');
  console.log(`curl -X POST "${SUPABASE_URL}/functions/v1/reframe-forge" \\
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"negative_thought":"I always fail","context":"work stress"}'`);
}

function provideDiagnostics() {
  console.log('\n📋 Diagnostic Information:');
  console.log('==========================');
  
  console.log('\nEnvironment Variables Check:');
  console.log('- VITE_GEMINI_API_KEY:', process.env.VITE_GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
  console.log('- VITE_SUPABASE_PROJECT_URL:', process.env.VITE_SUPABASE_PROJECT_URL ? '✅ Set' : '❌ Missing');
  console.log('- VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing');
  
  console.log('\nConfiguration:');
  console.log('- Gemini API Key:', GEMINI_API_KEY.substring(0, 20) + '...');
  console.log('- Supabase URL:', SUPABASE_URL);
  console.log('- Test Thought: "I always fail at everything I try"');
  console.log('- Test Context: "Work-related stress"');
  
  console.log('\nExpected Edge Function Environment Variable:');
  console.log('- GEMINI_API_KEY (must be set in Supabase project settings)');
}

async function runAllTests() {
  console.log('Starting comprehensive AI service tests...\n');
  
  const results = {
    gemini: await testGeminiApiKey(),
    supabase: await testSupabaseUrl()
  };
  
  console.log('\n📊 Test Results Summary');
  console.log('========================');
  console.log('Gemini API Key:', results.gemini ? '✅ PASS' : '❌ FAIL');
  console.log('Supabase URL:', results.supabase ? '✅ PASS' : '❌ FAIL');
  
  provideDiagnostics();
  provideCurlCommands();
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 Basic connectivity tests passed!');
    console.log('Next step: Add GEMINI_API_KEY to your Supabase project settings');
    console.log('Then redeploy your edge functions.');
  } else {
    console.log('\n⚠️  Some tests failed.');
    console.log('Please check the error messages above and ensure:');
    console.log('1. Your Gemini API key is valid');
    console.log('2. Your Supabase project is accessible');
    console.log('3. You have added GEMINI_API_KEY to Supabase environment variables');
  }
}

// Run tests
runAllTests().catch(console.error);