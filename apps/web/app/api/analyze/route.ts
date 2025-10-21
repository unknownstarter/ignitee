export async function POST(req: Request) {
  try {
    const { prd } = await req.json();
    
    if (!prd || typeof prd !== 'string') {
      return new Response(
        JSON.stringify({ error: 'PRD is required' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' }}
      );
    }

    const functionsUrl = process.env.NEXT_PUBLIC_SUPABASE_FUNCTIONS_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!functionsUrl || !anonKey) {
      return new Response(
        JSON.stringify({ error: 'Supabase configuration missing' }), 
        { status: 500, headers: { 'Content-Type': 'application/json' }}
      );
    }

    // Call Supabase Edge Function
    const response = await fetch(`${functionsUrl}/analyze-prd`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${anonKey}` 
      },
      body: JSON.stringify({ prd })
    });

    if (!response.ok) {
      throw new Error(`Edge function failed: ${response.status}`);
    }

    const result = await response.json();
    return new Response(
      JSON.stringify(result), 
      { headers: { 'Content-Type': 'application/json' }}
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' }}
    );
  }
}
