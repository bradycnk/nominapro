const fs = require('fs');
const content = fs.readFileSync('components/BranchManager.tsx', 'utf-8');

const searchRegex = /      if \(editingBranch\) \{\n        const \{ error \} = await supabase.from\('sucursales'\).update\(payload\).eq\('id', editingBranch.id\);\n        if \(error\) throw error;\n      \} else \{\n        const \{ error \} = await supabase.from\('sucursales'\).insert\(\[payload\]\);\n        if \(error\) throw error;\n      \}/g;

const replaceWith = `      let newBranchId = editingBranch?.id;

      if (editingBranch) {
        const { error } = await supabase.from('sucursales').update(payload).eq('id', editingBranch.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('sucursales').insert([payload]).select().single();
        if (error) throw error;
        newBranchId = data.id;
      }

      if (formData.es_principal && newBranchId) {
        const { error: updateError } = await supabase
          .from('sucursales')
          .update({ es_principal: false })
          .neq('id', newBranchId);
        if (updateError) {
          console.error("No se pudieron desmarcar las otras sucursales principales:", updateError);
        }
      }`;

const newContent = content.replace(searchRegex, replaceWith);
fs.writeFileSync('components/BranchManager.tsx', newContent);
console.log('Patch applied successfully.');
