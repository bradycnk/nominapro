with open("components/PayrollProcessor.tsx", "r") as f:
    content = f.read()

search = """                     onChange={(e) => {
                       const val = e.target.value === '' ? '' : Number(e.target.value);
                       setGlobalBonoBs(val);
                       const valNum = Number(val) || 0;
                       const newMonto = { ...montoIndicador };
                       filteredEmps.forEach(emp => {
                         newMonto[emp.id] = valNum;
                       });
                       setMontoIndicador(newMonto);
                     }}"""

replace = """                     onChange={(e) => {
                       const val = e.target.value === '' ? '' : Number(e.target.value);
                       setGlobalBonoBs(val);
                       setGlobalBonoUsd(val === '' ? '' : val / tasa);
                       const valNum = Number(val) || 0;
                       const newMonto = { ...montoIndicador };
                       filteredEmps.forEach(emp => {
                         newMonto[emp.id] = valNum;
                       });
                       setMontoIndicador(newMonto);
                     }}"""

if search in content:
    content = content.replace(search, replace)
    with open("components/PayrollProcessor.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Search string not found")
