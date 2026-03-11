const fs = require('fs');
let content = fs.readFileSync('components/PayrollProcessor.tsx', 'utf-8');

// 1. Añadir estado para principalBranch
const stateRegex = /  const \[branches, setBranches\] = useState<any\[\]>\(\[\]\);/;
content = content.replace(stateRegex, "  const [branches, setBranches] = useState<any[]>([]);\n  const [principalBranch, setPrincipalBranch] = useState<any>(null);");

// 2. Modificar loadData para buscar principalBranch
const loadDataRegex = /    const \{ data: brData \} = await supabase.from\('sucursales'\).select\('id, nombre_id'\).order\('nombre_id'\);\n    const \{ data: empData \} = await supabase.from\('empleados'\).select\('\*, sucursales\(\*\)'\).eq\('activo', true\);/;
const loadDataReplace = `    const { data: brData } = await supabase.from('sucursales').select('*').order('nombre_id');
    const { data: empData } = await supabase.from('empleados').select('*, sucursales(*)').eq('activo', true);

    const principal = brData?.find((b: any) => b.es_principal) || null;
    setPrincipalBranch(principal);`;

content = content.replace(loadDataRegex, loadDataReplace);

// 3. Modificar getPayrollBreakdown -> generatePDF
// Necesitamos que generatePDF use principalBranch.
// Modificaremos generatePDF para usar principalBranch

const pdfHeader1 = /pdf.text\(\`EMPRESA: \$\{emp\.sucursales\?\.nombre_id \|\| 'FarmaNomina C\.A\.'\}\`, 15, y\);\n    pdf.text\(\`RIF: \$\{emp\.sucursales\?\.rif \|\| 'J-12345678-9'\}\`, pageWidth - 15, y, \{ align: "right" \}\);/;
const pdfHeader1Replace = `pdf.text(\`EMPRESA: \${principalBranch?.nombre_id || emp.sucursales?.nombre_id || 'FarmaNomina C.A.'}\`, 15, y);
    pdf.text(\`RIF: \${principalBranch?.rif || emp.sucursales?.rif || 'J-12345678-9'}\`, pageWidth - 15, y, { align: "right" });`;
content = content.replace(pdfHeader1, pdfHeader1Replace);


// En getPayrollBreakdown ya no se usa emp.sucursales, así que nada más.
fs.writeFileSync('components/PayrollProcessor.tsx', content);
console.log('Patch applied to PayrollProcessor.tsx');
