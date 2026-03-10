
export const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
};

export const getCorsHeaders = (origin: string | null) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
  ];

  const envOrigins = Deno.env.get('ALLOWED_ORIGINS');
  if (envOrigins) {
    allowedOrigins.push(...envOrigins.split(',').map((o) => o.trim()));
  }

  if (origin && allowedOrigins.includes(origin)) {
    return {
      ...corsHeaders,
      'Access-Control-Allow-Origin': origin,
    };
  }

  // Fallback to the first allowed origin.
  // The browser will block the request if the Origin header doesn't match this value.
  return {
    ...corsHeaders,
    'Access-Control-Allow-Origin': allowedOrigins[0],
  };
};
