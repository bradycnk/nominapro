import re

with open("components/PayrollProcessor.tsx", "r") as f:
    content = f.read()

search = """               <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-inner">
                 <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Bono Proyectado a Pagar (Sucursal)</div>
                 <div className="flex items-center gap-2 mt-2"><span className="text-sm font-bold text-indigo-700">Bs.</span><input type="number" className="w-40 p-2 border border-indigo-200 rounded-lg text-xl font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none" value={globalPoteRepartidoBs} readOnly /><span className="text-sm font-bold text-indigo-700">%</span><input type="number" className="w-20 p-2 border border-indigo-200 rounded-lg text-xl font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="100" /></div>
                 <div className="text-sm font-bold text-indigo-500/80 mt-1">≈ ${(globalPoteRepartidoBs / tasa).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} USD</div>
               </div>"""

replace = """               <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-inner">
                 <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Total Bono Proyectado a Pagar (Sucursal)</div>
                 <div className="flex items-center gap-2 mt-2">
                   <span className="text-sm font-bold text-indigo-700">Bs.</span>
                   <input
                     type="number"
                     className="w-40 p-2 border border-indigo-200 rounded-lg text-xl font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={globalBonoBs}
                     onChange={(e) => {
                       const val = e.target.value === '' ? '' : Number(e.target.value);
                       setGlobalBonoBs(val);
                       const valNum = Number(val) || 0;
                       const newMonto = { ...montoIndicador };
                       filteredEmps.forEach(emp => {
                         newMonto[emp.id] = valNum;
                       });
                       setMontoIndicador(newMonto);
                     }}
                     placeholder="0"
                   />
                   <span className="text-sm font-bold text-indigo-700">%</span>
                   <input
                     type="number"
                     className="w-20 p-2 border border-indigo-200 rounded-lg text-xl font-black text-indigo-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                     value={globalBonoPerc}
                     onChange={(e) => {
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
                 <div className="text-[10px] font-bold text-indigo-500/80 mt-3 pt-2 border-t border-indigo-200/50 flex justify-between items-center">
                   <span>TOTAL A REPARTIR CALCULADO:</span>
                   <span className="text-sm text-indigo-700">
                     Bs. {globalPoteRepartidoBs.toLocaleString('es-VE', {minimumFractionDigits:2})}
                     <span className="font-medium opacity-80 text-xs ml-1">(≈ ${(globalPoteRepartidoBs / tasa).toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} USD)</span>
                   </span>
                 </div>
               </div>"""

if search in content:
    content = content.replace(search, replace)
    with open("components/PayrollProcessor.tsx", "w") as f:
        f.write(content)
    print("Success")
else:
    print("Search string not found")
