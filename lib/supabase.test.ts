import test from 'node:test';
import assert from 'node:assert';

test('Supabase client is exported and correctly initialized', async () => {
  // Use dynamic import to safely import the module and handle the environment
  const { supabase } = await import('./supabase.ts');

  assert.ok(supabase, 'Supabase client should be exported and defined');

  // Verify it has the core expected properties/methods
  assert.ok(supabase.auth, 'Supabase client should have auth property');
  assert.ok(supabase.from, 'Supabase client should have from method');
  assert.ok(supabase.storage, 'Supabase client should have storage property');
});
