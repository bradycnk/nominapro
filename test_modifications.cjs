const fs = require('fs');

const bm = fs.readFileSync('components/BranchManager.tsx', 'utf-8');
const pp = fs.readFileSync('components/PayrollProcessor.tsx', 'utf-8');

if (bm.includes('if (formData.es_principal && newBranchId) {') &&
    bm.includes('.update({ es_principal: false })') &&
    bm.includes(".neq('id', newBranchId);")) {
  console.log('BranchManager.tsx verified: ok');
} else {
  console.log('BranchManager.tsx verified: failed');
}

if (pp.includes('const [principalBranch, setPrincipalBranch] = useState<any>(null);') &&
    pp.includes('const principal = brData?.find((b: any) => b.es_principal) || null;') &&
    pp.includes('principalBranch?.nombre_id') &&
    pp.includes('principalBranch?.rif')) {
  console.log('PayrollProcessor.tsx verified: ok');
} else {
  console.log('PayrollProcessor.tsx verified: failed');
}
