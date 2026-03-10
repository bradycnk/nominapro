import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { getCorsHeaders } from "../_shared/cors.ts";

const json = (body: unknown, cors: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const cors = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, cors, 405);
  }

  try {
    const { query } = await req.json();
    if (!query || typeof query !== 'string') {
      return json({ error: 'Missing query.' }, cors, 400);
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');

    // Modo simulación cuando no hay secreto configurado en Supabase.
    if (!apiKey) {
      console.warn("No GEMINI_API_KEY found. Using simulation mode.");
      let fakeReply = "Lo siento, para usar mi inteligencia completa necesitas configurar la clave de API de Gemini.";
      
      if (query.toLowerCase().includes('hola')) fakeReply = "¡Hola! Soy Farmabot. ¿En qué puedo ayudarte?";
      if (query.toLowerCase().includes('lottt')) fakeReply = "La Ley Orgánica del Trabajo (LOTTT) regula las relaciones laborales en Venezuela. ¿Tienes una duda específica sobre prestaciones o vacaciones?";
      if (query.toLowerCase().includes('nómina') || query.toLowerCase().includes('nomina')) fakeReply = "Puedo ayudarte a calcular la nómina. Recuerda verificar la tasa del BCV antes de procesar.";

      return json({ reply: fakeReply }, cors, 200);
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = `
      Eres FarmaBot, un asistente experto en gestión de nómina para farmacias en Venezuela bajo la LOTTT.
      Tus respuestas deben ser profesionales, concisas y útiles.
      Conoces conceptos como Cestaticket, Salario Base, IVSS, FAOV, Prestaciones Sociales.
      La moneda local es Bolívares (VES) y la referencia es Dólares (USD).
    `;

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemPrompt }],
        },
        {
          role: "model",
          parts: [{ text: "Entendido. Soy FarmaBot, experto en nómina venezolana. ¿En qué puedo ayudarte?" }],
        },
      ],
    });

    const result = await chat.sendMessage(query);
    const response = await result.response;
    const text = response.text();

    return json({ reply: text }, cors, 200);
  } catch (error: any) {
    return json({ error: error?.message || 'Unexpected error.' }, cors, 500);
  }
});
