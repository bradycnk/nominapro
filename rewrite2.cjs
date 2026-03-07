const fs = require('fs');
const file = 'F:/dist/nominapro-main/components/EmployeeModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/interface EmployeeForm \{([\s\S]*?)\}/, `interface EmployeeForm {$1
  mano_dominante: 'Derecho' | 'Zurdo' | 'Ambidiestro' | '';
  estado_laboral: 'Activo' | 'Suspendido' | 'Vacaciones';
}`);

content = content.replace(/const getDefaultFormData = \(\): EmployeeForm => \(\{([\s\S]*?)\}\);/, `const getDefaultFormData = (): EmployeeForm => ({
$1,
  mano_dominante: '',
  estado_laboral: 'Activo',
});`);

content = content.replace(/const normalizeEmployeeToForm = \(emp: Empleado\): EmployeeForm => \(\{([\s\S]*?)\}\);/, `const normalizeEmployeeToForm = (emp: Empleado): EmployeeForm => ({
$1,
  mano_dominante: emp.mano_dominante || '',
  estado_laboral: emp.estado_laboral || (emp.activo ? 'Activo' : 'Suspendido') as 'Activo' | 'Suspendido' | 'Vacaciones',
});`);

fs.writeFileSync(file, content);
console.log('Done rewriting file.');