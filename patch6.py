with open("components/PayrollProcessor.tsx", "r") as f:
    content = f.read()

search = """                     onChange={(e) => {
                       const val = e.target.value === '' ? '' : Number(e.target.value);
                       setGlobalBonoPerc(val);
                       const valNum = Number(val) || 0;
                       const newPerc = { ...porcentajeRepartir };
                       filteredEmps.forEach(emp => {
                         newPerc[emp.id] = valNum;
                       });
                       setPorcentajeRepartir(newPerc);
                     }}
                     placeholder="100"
                   />
                 </div>
                 <div className="text-[10px] font-bold text-indigo-500/80 mt-3 pt-2 border-t border-indigo-200/50 flex justify-between items-center">"""

replace = """                     onChange={(e) => {
                       const val = e.target.value === '' ? '' : Number(e.target.value);
                       setGlobalBonoPerc(val);
                       const valNum = Number(val) || 0;
                       const newPerc = { ...porcentajeRepartir };
                       filteredEmps.forEach(emp => {
                         newPerc[emp.id] = valNum;
                       });
                       setPorcentajeRepartir(newPerc);
                     }}
                     placeholder="100"
                   />
                 </div>
                 <div className="flex items-center gap-2 mt-2">
                   <span className="text-sm font-bold text-indigo-700 w-[18px] text-center">$</span>
                   <input
                     type="number"
                     className="w-40 p-2 border border-indigo-200 rounded-lg text-xl font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={globalBonoUsd === '' ? '' : Number(globalBonoUsd).toFixed(2)}
                     onChange={(e) => {
                       const val = e.target.value === '' ? '' : Number(e.target.value);
                       setGlobalBonoUsd(val);
                       const valBs = val === '' ? '' : val * tasa;
                       setGlobalBonoBs(valBs);
                       const valNumBs = Number(valBs) || 0;
                       const newMonto = { ...montoIndicador };
                       filteredEmps.forEach(emp => {
                         newMonto[emp.id] = valNumBs;
                       });
                       setMontoIndicador(newMonto);
                     }}
                     placeholder="0.00"
                   />
                 </div>
                 <div className="text-[10px] font-bold text-indigo-500/80 mt-3 pt-2 border-t border-indigo-200/50 flex justify-between items-center">"""

if search in content:
    content = content.replace(search, replace)
    with open("components/PayrollProcessor.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Search string not found")
