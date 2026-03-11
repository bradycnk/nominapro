const fs = require('fs');
let content = fs.readFileSync('components/PayrollProcessor.tsx', 'utf-8');

// Modificar loadDataReplace nuevamente si nos falto en generateReceipt2PDF
const pdfHeader2 = /pdf.text\(\`Nombres y Apellidos: \$\{emp\.nombre\} \$\{emp\.apellido\}\`, 20, 56\);\n    pdf.text\(\`Cédula de Identidad: V-\$\{emp\.cedula\}\`, 120, 56\);\n    pdf.text\(\`Cargo: \$\{emp\.cargo \|\| 'No especificado'\}\`, 20, 62\);/;

const pdfHeader2Replace = `pdf.text(\`Empresa: \${principalBranch?.nombre_id || emp.sucursales?.nombre_id || 'FarmaNomina C.A.'} - RIF: \${principalBranch?.rif || emp.sucursales?.rif || 'J-12345678-9'}\`, 20, 50);
    pdf.text(\`Nombres y Apellidos: \${emp.nombre} \${emp.apellido}\`, 20, 58);
    pdf.text(\`Cédula de Identidad: V-\${emp.cedula}\`, 120, 58);
    pdf.text(\`Cargo: \${emp.cargo || 'No especificado'}\`, 20, 64);`;

content = content.replace(pdfHeader2, pdfHeader2Replace);

// Adjust rectangle to fit extra info
content = content.replace(/pdf.rect\(15, 40, 180, 25, 'F'\);/, "pdf.rect(15, 40, 180, 28, 'F');");
content = content.replace(/pdf.text\("DATOS DEL BENEFICIARIO", 20, 48\);/, "pdf.text(\"DATOS DEL BENEFICIARIO\", 20, 45);");

fs.writeFileSync('components/PayrollProcessor.tsx', content);
console.log('Patch 2 applied to PayrollProcessor.tsx');
