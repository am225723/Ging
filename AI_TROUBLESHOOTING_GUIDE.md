# AI Analysis Failed - Troubleshooting Guide

## Quick Fix Summary

The "AI Analysis Failed" error is most likely caused by **missing environment variables in your Supabase Edge Functions**. Here's the immediate fix:

### 🔧 **IMMEDIATE FIX (5 minutes)**

1. **Add Environment Variable to Supabase:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project: `tyfwgbmtbgzjzjejgkzb`
   - Go to **Settings** → **API**
   - Scroll to **Environment Variables**
   - Click **Add Environment Variable**
   - **Key**: `GEMINI_API_KEY`
   - **Value**: `AIzaSyARhDWIEFUjS8pYXK_g3vocsWmnwkRp93A`

2. **Redeploy Edge Functions:**
   ```bash
   cd Ging
   supabase functions deploy reframe-forge
   supabase functions deploy journal-ai
   ```

## 🔍 **Detailed Diagnosis**

### Error Flow Analysis
```
User clicks "AI Assist" → Frontend calls Edge Function → Edge Function needs GEMINI_API_KEY → Key missing → Error returned → "AI Analysis Failed"
```

### Root Causes Identified

1. **Environment Variable Mismatch**
   - Frontend uses: `VITE_GEMINI_API_KEY`
   - Edge Functions use: `GEMINI_API_KEY`
   - **Solution**: Add `GEMINI_API_KEY` to Supabase environment variables

2. **Edge Function Deployment**
   - Functions may not be deployed with latest environment variables
   - **Solution**: Redeploy functions after adding environment variables

3. **API Key Validation**
   - Gemini API key might be invalid or expired
   - **Solution**: Test API key validity

## 🧪 **Testing Your Fix**

### Option 1: Use the Debug Panel
1. Import the debug component in your app
2. Add `<AIDebugPanel />` to any page
3. Click "Run All Tests" to verify everything works

### Option 2: Run Test Script
```bash
cd Ging
node test-ai-connection.mjs
```

### Option 3: Manual Testing
1. Open browser console
2. Navigate to Reframe Forge or Journal page
3. Click AI Assist button
4. Check console for detailed error messages

## 📋 **Step-by-Step Verification**

### ✅ **Check 1: Environment Variables**
- [ ] `GEMINI_API_KEY` added to Supabase project settings
- [ ] API key is valid (not expired)
- [ ] API key has available quota

### ✅ **Check 2: Edge Functions**
- [ ] Functions are deployed and running
- [ ] Functions have access to environment variables
- [ ] No deployment errors in Supabase logs

### ✅ **Check 3: Frontend Configuration**
- [ ] Frontend environment variables are set correctly
- [ ] Supabase client is properly initialized
- [ ] User is authenticated when calling AI functions

### ✅ **Check 4: Network Connectivity**
- [ ] Browser can reach Supabase
- [ ] Supabase can reach Gemini API
- [ ] No CORS issues

## 🔧 **Enhanced Error Handling**

I've created enhanced versions of your service files with better error handling:

- `reframeForgeClientEnhanced.js` - Better error messages and debugging
- `journalAiClientEnhanced.js` - Improved error reporting
- `AIDebugPanel.jsx` - Visual debugging component

To use the enhanced versions, update your imports:

```javascript
// In ReframeForge.jsx
import { getReframe } from '../../services/reframeForgeClientEnhanced';

// In Journal.jsx  
import { processJournalEntry } from '../../services/journalAiClientEnhanced';
```

## 🚨 **Common Issues & Solutions**

### Issue: "Edge function invocation failed"
**Solution**: Functions not deployed or environment variables not set
```bash
supabase functions deploy
```

### Issue: "Gemini API failed with status 400"
**Solution**: Invalid API key or malformed request
- Test API key with curl command
- Check request format in edge function

### Issue: "Unauthorized" error
**Solution**: User not authenticated
- Ensure user is logged in before calling AI functions
- Check auth token is being passed correctly

### Issue: "Network connection failed"
**Solution**: Connectivity issues
- Check internet connection
- Verify Supabase project URL is correct
- Check browser console for CORS errors

## 📊 **Monitoring & Logging**

### Enable Detailed Logging
Add this to your edge functions for better debugging:

```typescript
// In your edge function
console.log('Function called with:', { negative_thought, context });
console.log('Environment check:', { 
  hasGeminiKey: !!Deno.env.get("GEMINI_API_KEY"),
  hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL")
});
```

### Check Supabase Logs
1. Go to Supabase Dashboard
2. Navigate to **Logs** → **Edge Functions**
3. Look for error messages from your functions

## 🔄 **If the Quick Fix Doesn't Work**

1. **Test API Key Separately:**
   ```bash
   curl -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyARhDWIEFUjS8pYXK_g3vocsWmnwkRp93A" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'
   ```

2. **Check Function Logs:**
   ```bash
   supabase functions serve --debug
   ```

3. **Verify Deployment:**
   ```bash
   supabase functions list
   ```

4. **Test Connection:**
   Run the test script: `node test-ai-connection.mjs`

## 📞 **Still Need Help?**

If you've tried all the above steps and still have issues:

1. **Check Supabase Status**: https://status.supabase.com/
2. **Check Gemini API Status**: https://status.cloud.google.com/
3. **Review Edge Function Logs** in Supabase dashboard
4. **Test with the debug panel** for detailed error messages
5. **Verify your Gemini API quota** hasn't been exceeded

## 🔐 **Security Notes**

- Your API key is currently exposed in the `.env` file
- Consider regenerating the API key after fixing the issue
- Use Supabase secrets management for production
- Monitor API usage to prevent abuse

---

**Next Steps**: Start with the immediate fix (adding the environment variable), then test using one of the provided methods. The debug panel will give you the most detailed information about what's failing.