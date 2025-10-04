// supabase/functions/_shared/cors.ts

// Standard CORS headers for Supabase Edge Functions
export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, PUT, DELETE, OPTIONS",
  // Optional: cache preflight for 1 hour
  "Access-Control-Max-Age": "3600",
};

// Handle CORS preflight (OPTIONS) requests.
// Returns a Response for OPTIONS, or null to continue normal handling.
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  return null;
}
