const fs = require('fs');
const file = 'F:/dist/nominapro-main/components/PayrollProcessor.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Reemplazar getPayrollBreakdown
content = content.replace(/const getPayrollBreakdown = \(emp: Empleado\) => \{[\s\S]*?const neto = totalAsignaciones - totalDeducciones;\s*return \{[\s\S]*?};\s*\};/, `const getPayrollBreakdown = (emp: Empleado) => {
    if (!config) return null;

    const effectiveConfig = getEffectiveReceiptConfig(emp);

    const empAsistencias = attendances.filter(a => a.empleado_id === emp.id);
    const hoursData = processAttendanceRecords(empAsistencias);
    const usaCalculoAsistencia = hoursData.diasTrabajados > 0;

    const salarioHora = (calculatePayroll(emp, config, 15, periodo, 0)).salario_diario_normal / 8;
    const calc = calculatePayroll(emp, config, 15, periodo, 0);

    const getValue = (item: any, defaultMonto: number, defaultCantidad: number) => {
       if (!item || !item.enabled) return { total: 0, qty: 0, unit: 0 };
       const qty = item.cantidad ?? defaultCantidad;
       const unit = item.montoUnitario ?? defaultMonto;
       return { total: qty * unit, qty, unit };
    };

    const cLaborados = getValue(effectiveConfig.diasLaborados, calc.sueldo_periodo / 15, usaCalculoAsistencia ? hoursData.diasTrabajados : 15);
    const cDescanso = getValue(effectiveConfig.diasDescanso, 5.52, 4);
    const cDescansoLab = getValue(effectiveConfig.descansoLaborado, 4.33, 0);
    const cDomLab = getValue(effectiveConfig.domingoLaborado, 6.50, 0);
    const cExtDiur = getValue(effectiveConfig.horasExtrasDiurnas, salarioHora * 1.5, hoursData.totalExtraDiurna);
    const cFerLab = getValue(effectiveConfig.feriadosLaborados, 6.50, 0);
    const cBonoNoc = getValue(effectiveConfig.bonoNocturno, salarioHora * 0.30, hoursData.totalNightHours);
    const cTurnos = getValue(effectiveConfig.turnosLaborados, 8.42, 0);
    const cBonoMix = getValue(effectiveConfig.bonoJornadaMixta, 0, 0);
    const cExtNoc = getValue(effectiveConfig.horasExtrasNocturnas, salarioHora * 1.5, hoursData.totalExtraNocturna);
    const cCompens = getValue(effectiveConfig.diasCompensatorios, 4.33, 0);
    const cSabLab = getValue(effectiveConfig.sabadoLaborado, 4.33, 0);
    const cCesta = getValue(effectiveConfig.bonoAlimentacion, calc.bono_alimentacion_vef, 1);
    const cOtras = getValue(effectiveConfig.otrasAsignaciones, 0, 1);

    const totalAsignaciones = cLaborados.total + cDescanso.total + cDescansoLab.total + cDomLab.total + cExtDiur.total + cFerLab.total + cBonoNoc.total + cTurnos.total + cBonoMix.total + cExtNoc.total + cCompens.total + cSabLab.total + cCesta.total + cOtras.total;

    const cIvss = getValue(effectiveConfig.sso, calc.deduccion_ivss, 1);
    const cSpf = getValue(effectiveConfig.rpe, calc.deduccion_spf, 1);
    const cFaov = getValue(effectiveConfig.faov, calc.deduccion_faov, 1);
    const cIslr = getValue(effectiveConfig.islr, 0, 1);
    const cVales = getValue(effectiveConfig.vales, 0, 1);

    const deduccionIvss = cIvss.total;
    const deduccionSpf = cSpf.total;
    const deduccionFaov = cFaov.total;

    const maxAdelantosPermitido = Math.max(0, totalAsignaciones - (cIvss.total + cSpf.total + cFaov.total + cIslr.total + cVales.total));
    const adelantosCalculados = getAdelantosForPeriod(emp.id, maxAdelantosPermitido);
    const totalAdelantos = adelantosCalculados.total;
    const totalAdelantoNomina = adelantosCalculados.aplicados.filter((item:any) => item.tipo === 'adelanto_nomina').reduce((sum:any, item:any) => sum + item.deducted, 0);
    const totalPrestamoCredito = adelantosCalculados.aplicados.filter((item:any) => item.tipo === 'prestamo_credito').reduce((sum:any, item:any) => sum + item.deducted, 0);

    const totalDeducciones = cIvss.total + cSpf.total + cFaov.total + cIslr.total + cVales.total + totalAdelantos;
    const neto = totalAsignaciones - totalDeducciones;

    return {
      calc, hoursData, usaCalculoAsistencia,
      cLaborados, cDescanso, cDescansoLab, cDomLab, cExtDiur, cFerLab, cBonoNoc, cTurnos, cBonoMix, cExtNoc, cCompens, cSabLab, cCesta, cOtras,
      cIvss, cSpf, cFaov, cIslr, cVales,
      montoHorasNormales: cLaborados.total, // fallback variables to not break summary row
      montoExtrasDiurnas: cExtDiur.total,
      montoExtrasNocturnas: cExtNoc.total,
      montoBonoNocturno: cBonoNoc.total,
      montoCestaticket: cCesta.total,
      deduccionIvss, deduccionSpf, deduccionFaov,
      adelantosAplicados: adelantosCalculados.aplicados, totalAdelantos,
      totalAdelantoNomina, totalPrestamoCredito, totalAsignaciones, totalDeducciones, neto,
      effectiveConfig
    };
  };`);

// 2. Replace generatePDF contents
content = content.replace(/const generatePDF = async \(emp: Empleado, breakdownInput: ReturnType<typeof getPayrollBreakdown>, doc\?: jsPDF\) => \{[\s\S]*?if \(!isGlobal\) \{\s*pdf.save\(`Recibo_\$\{emp.cedula\}_\$\{periodo\}.pdf`\);\s*\}\s*\};/, `const generatePDF = async (emp: Empleado, breakdownInput: ReturnType<typeof getPayrollBreakdown>, doc?: jsPDF) => {
    if (!config || !breakdownInput) return;

    const isGlobal = !!doc;
    const pdf = doc || new jsPDF();

    const {
      calc, effectiveConfig,
      cLaborados, cDescanso, cDescansoLab, cDomLab, cExtDiur, cFerLab, cBonoNoc, cTurnos, cBonoMix, cExtNoc, cCompens, cSabLab, cCesta, cOtras,
      cIvss, cSpf, cFaov, cIslr, cVales,
      totalAdelantos, totalAdelantoNomina, totalPrestamoCredito, neto
    } = breakdownInput;
    const startDay = periodo === 'Q1' ? 1 : 16;
    const endDay = periodo === 'Q1' ? 15 : new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const fechaDesde = `\$\{startDay.toString().padStart(2, '0')\}/\$\{(selectedMonth + 1).toString().padStart(2, '0')\}/\$\{selectedYear\}`;
    const fechaHasta = `\$\{endDay.toString().padStart(2, '0')\}/\$\{(selectedMonth + 1).toString().padStart(2, '0')\}/\$\{selectedYear\}`;

    const pageWidth = pdf.internal.pageSize.width;
    const fechaEmision = new Date().toLocaleString('es-VE');
    
    try {
        const imgWidth = 25;
        pdf.addImage(LOGO_URL, 'JPEG', 15, 15, imgWidth, 15);
    } catch (e) {}

    pdf.setFont("courier", "bold");
    pdf.setFontSize(14);
    pdf.text("RECIBO DE PAGO DE NÓMINA", pageWidth / 2, 25, { align: "center" });
    
    pdf.setFontSize(8);
    pdf.setFont("courier", "normal");
    pdf.text(`Emisión: \$\{fechaEmision\}`, pageWidth - 15, 15, { align: "right" });

    let y = 50;
    pdf.setFontSize(9);
    pdf.text(`EMPRESA: \$\{emp.sucursales?.nombre_id || 'FarmaNomina C.A.'\}`, 15, y);
    pdf.text(`RIF: \$\{emp.sucursales?.rif || 'J-12345678-9'\}`, pageWidth - 15, y, { align: "right" });
    y += 10;
    
    pdf.setFont("courier", "bold");
    pdf.text(`TRABAJADOR: \$\{emp.nombre\} \$\{emp.apellido\}`, 15, y);
    pdf.text(`C.I.: \$\{emp.cedula\}`, pageWidth - 15, y, { align: "right" });
    y += 5;
    pdf.setFont("courier", "normal");
    pdf.text(`Cargo: \$\{emp.cargo || 'General'\}`, 15, y);
    pdf.text(`Período: \$\{fechaDesde\} al \$\{fechaHasta\}`, pageWidth - 15, y, { align: "right" });
    y += 5;
    pdf.text(`Salario Base Mensual (Bs): \$\{Number(calc.sueldo_base_mensual).toLocaleString('es-VE', { minimumFractionDigits: 2 })\}`, 15, y);
    y += 10;
    
    pdf.setFont("courier", "bold");
    pdf.text("CONCEPTO", 15, y);
    pdf.text("CANT", 90, y, { align: "right" });
    pdf.text("ASIGNACIONES", 145, y, { align: "right" });
    pdf.text("DEDUCCIONES", 195, y, { align: "right" }); 
    y += 5;
    pdf.line(15, y, pageWidth - 15, y);
    y += 5;
    pdf.setFont("courier", "normal");

    const addRow = (concepto: string, cant: number | string, asignacion: number | null, deduccion: number | null) => {
        pdf.text(concepto.substring(0, 40), 15, y);
        if (cant) pdf.text(`\$\{cant\}`, 90, y, { align: "right" });
        if (asignacion !== null && asignacion > 0) pdf.text(`\$\{asignacion.toLocaleString('es-VE', {minimumFractionDigits: 2})\}`, 145, y, { align: "right" });
        if (deduccion !== null && deduccion > 0) pdf.text(`\$\{deduccion.toLocaleString('es-VE', {minimumFractionDigits: 2})\}`, 195, y, { align: "right" });
        y += 5;
    };

    if (effectiveConfig.diasLaborados?.enabled) addRow("Días Laborados Art 184", cLaborados.qty, cLaborados.total, null);
    if (effectiveConfig.diasDescanso?.enabled) addRow("Días de descanso Art 119", cDescanso.qty, cDescanso.total, null);
    if (effectiveConfig.descansoLaborado?.enabled) addRow("Adicional por descanso lab Art 119-120", cDescansoLab.qty, cDescansoLab.total, null);
    if (effectiveConfig.domingoLaborado?.enabled) addRow("Adicional por domingo lab Art 119-120", cDomLab.qty, cDomLab.total, null);
    if (effectiveConfig.horasExtrasDiurnas?.enabled) addRow("Hora(s) Extras Diurnas", cExtDiur.qty, cExtDiur.total, null);
    if (effectiveConfig.feriadosLaborados?.enabled) addRow("Adicional por feriados lab Art 119-120", cFerLab.qty, cFerLab.total, null);
    if (effectiveConfig.bonoNocturno?.enabled) addRow("Bono Nocturno Art 117", cBonoNoc.qty, cBonoNoc.total, null);
    if (effectiveConfig.turnosLaborados?.enabled) addRow("Turno(s) Laborado(s)", cTurnos.qty, cTurnos.total, null);
    if (effectiveConfig.bonoJornadaMixta?.enabled) addRow("Bono por Jornada Mixta Art 117/173-3", cBonoMix.qty, cBonoMix.total, null);
    if (effectiveConfig.horasExtrasNocturnas?.enabled) addRow("Hora(s) Extras Nocturnas", cExtNoc.qty, cExtNoc.total, null);
    if (effectiveConfig.diasCompensatorios?.enabled) addRow("Día(s) Compensatorios Art 188", cCompens.qty, cCompens.total, null);
    if (effectiveConfig.sabadoLaborado?.enabled) addRow("Día(s) Sábado Laborado", cSabLab.qty, cSabLab.total, null);
    if (effectiveConfig.bonoAlimentacion?.enabled) addRow("Bono Alimentación (Cestaticket)", cCesta.qty, cCesta.total, null);
    if (effectiveConfig.otrasAsignaciones?.enabled) addRow("Otras Asignaciones", cOtras.qty, cOtras.total, null);

    if (effectiveConfig.sso?.enabled) addRow("S.S.O", cIvss.qty, null, cIvss.total);
    if (effectiveConfig.rpe?.enabled) addRow("R.P.E", cSpf.qty, null, cSpf.total);
    if (effectiveConfig.faov?.enabled) addRow("FAOV", cFaov.qty, null, cFaov.total);
    if (effectiveConfig.islr?.enabled) addRow("Retención ISLR", cIslr.qty, null, cIslr.total);
    if (effectiveConfig.vales?.enabled) addRow("Vales", cVales.qty, null, cVales.total);

    if (totalAdelantos > 0) {
        if (totalAdelantoNomina > 0) addRow("Adelanto de Nómina", 1, null, totalAdelantoNomina);
        if (totalPrestamoCredito > 0) addRow("Préstamo / Crédito", 1, null, totalPrestamoCredito);
    }

    y += 5;
    pdf.line(15, y, pageWidth - 15, y);
    y += 5;
    pdf.setFont("courier", "bold");
    pdf.text("TOTAL NETO A RECIBIR (Bs.):", 15, y);
    pdf.text(`\$\{neto.toLocaleString('es-VE', {minimumFractionDigits: 2})\}`, 145, y, { align: "right" });
    
    y = pageWidth - 50; 
    if (y < 200) y = 220; 

    pdf.line(20, y, 90, y);
    pdf.text("Firma Trabajador", 35, y + 5);
    
    pdf.line(120, y, 190, y);
    pdf.text("Firma Empleador", 135, y + 5);

    if (!isGlobal) {
        pdf.save(`Recibo_\$\{emp.cedula\}_\$\{periodo\}.pdf`);
    }
  };`);

// 3. Replace showConfigModal render
const configModalHTML = `
      {/* Modal Configuración de Recibo */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white p-8 rounded-3xl w-full max-w-5xl shadow-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800">
                {receiptConfigEmployeeId ? `Configurar Recibo (\$\{employees.find(e => e.id === receiptConfigEmployeeId)?.nombre\} \$\{employees.find(e => e.id === receiptConfigEmployeeId)?.apellido\})` : 'Configurar Recibo Global'}
              </h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-4 py-2">Concepto</th>
                    <th className="px-4 py-2 text-center">Incluir</th>
                    <th className="px-4 py-2 text-center">Cant.</th>
                    <th className="px-4 py-2 text-right">Monto Uni. (Bs)</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs font-semibold text-slate-700">
                  {Object.entries({
                    diasLaborados: "Días Laborados Art 184",
                    diasDescanso: "Días de descanso Art 119",
                    descansoLaborado: "Adicional por descanso lab Art 119-120",
                    domingoLaborado: "Adicional por domingo lab Art 119-120",
                    horasExtrasDiurnas: "Hora(s) Extras Diurnas",
                    feriadosLaborados: "Adicional por feriados lab Art 119-120",
                    bonoNocturno: "Bono Nocturno Art 117",
                    turnosLaborados: "Turno(s) Laborado(s)",
                    bonoJornadaMixta: "Bono por Jornada Mixta Art 117/173-3",
                    horasExtrasNocturnas: "Hora(s) Extras Nocturnas",
                    diasCompensatorios: "Día(s) Compensatorios Art 188",
                    sabadoLaborado: "Día(s) Sábado Laborado",
                    bonoAlimentacion: "Bono Alimentación (Cestaticket)",
                    otrasAsignaciones: "Otras Asignaciones",
                    vales: "Vales",
                    sso: "S.S.O",
                    rpe: "R.P.E",
                    faov: "FAOV",
                    islr: "% de Retención ISLR"
                  }).map(([key, label]) => {
                    const item = (receiptConfig as any)[key] || { enabled: false, cantidad: 0, montoUnitario: 0 };
                    return (
                      <tr key={key} className="hover:bg-slate-50">
                        <td className="px-4 py-2">{label as string}</td>
                        <td className="px-4 py-2 text-center">
                          <input type="checkbox" checked={item.enabled} onChange={e => setReceiptConfig(prev => ({ ...prev, [key]: { ...item, enabled: e.target.checked } }))} />
                        </td>
                        <td className="px-4 py-2 text-center">
                          <input type="number" step="0.01" className="w-20 p-1 border rounded text-center" value={item.cantidad ?? 0} onChange={e => setReceiptConfig(prev => ({ ...prev, [key]: { ...item, cantidad: parseFloat(e.target.value) } }))} />
                        </td>
                        <td className="px-4 py-2 text-right">
                          <input type="number" step="0.01" className="w-24 p-1 border rounded text-right" value={item.montoUnitario ?? 0} onChange={e => setReceiptConfig(prev => ({ ...prev, [key]: { ...item, montoUnitario: parseFloat(e.target.value) } }))} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setReceiptConfig(defaultReceiptConfig)} className="px-5 py-3 bg-slate-100 rounded-xl text-slate-700 font-bold">Restablecer</button>
              <button
                onClick={handleSaveReceiptConfig}
                disabled={savingReceiptConfig}
                className="px-5 py-3 bg-emerald-600 rounded-xl text-white font-bold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {savingReceiptConfig ? 'Guardando...' : 'Guardar Configuración'}
              </button>
            </div>
          </div>
        </div>
      )}
`;
content = content.replace(/\{\/\* Modal Configuración de Recibo \*\/\}[\s\S]*?(?=<div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex justify-between items-center">)/, configModalHTML);

fs.writeFileSync(file, content);
console.log('Done rewriting file.');
