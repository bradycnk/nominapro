import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const json = (body: unknown, cors: any, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });

const isAdmin = async (supabase: SupabaseClient): Promise<boolean> => {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return false;

  const { data: profile, error: profileError } = await supabase
    .from('perfiles_admin')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile) return false;

  return profile.role === 'admin';
};

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const cors = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, cors, 405);
  }

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return json({ error: 'Missing Supabase environment variables.' }, cors, 500);
  }

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return json({ error: 'Missing Authorization header.' }, cors, 401);
  }

  const userSupabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const canCreateUsers = await isAdmin(userSupabase);
  if (!canCreateUsers) {
    return json({ error: 'Not authorized.' }, cors, 403);
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    const { email, password, role, fullName } = await req.json();

    if (!email || !password || !role) {
      return json({ error: 'Missing required fields.' }, cors, 400);
    }

    const { data: roleData, error: roleError } = await adminSupabase
      .from('roles')
      .select('id, name')
      .eq('name', role)
      .single();

    if (roleError || !roleData) {
      return json({ error: `Invalid role: ${role}` }, cors, 400);
    }

    const {
      data: { user },
      error: userError,
    } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: fullName ? { full_name: fullName } : undefined,
    });

    if (userError || !user) throw userError || new Error('User creation failed.');

    const { error: profileError } = await adminSupabase
      .from('perfiles_admin')
      .upsert(
        {
          id: user.id,
          full_name: fullName || user.user_metadata?.full_name || null,
          role: roleData.name,
        },
        { onConflict: 'id' }
      );

    if (profileError) throw profileError;

    const { error: userRoleError } = await adminSupabase
      .from('user_roles')
      .insert([{ user_id: user.id, role_id: roleData.id }]);

    if (userRoleError) throw userRoleError;

    return json({ user, role: roleData.name }, cors, 200);
  } catch (error: any) {
    return json({ error: error?.message || 'Unexpected error.' }, cors, 500);
  }
});
