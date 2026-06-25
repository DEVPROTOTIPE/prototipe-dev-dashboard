                  </div>
                </div>

              </div>
            </div>
          )}

          </div>
        </main>
      </div>

      {/* BOTTOM NAVIGATION - Móvil */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl pb-safe animate-slide-up">
        <div className="grid grid-cols-5 items-center justify-items-center px-1 py-1.5">
          {NAV_TABS.filter(tab => tab.id !== 'e2e' && tab.id !== 'cores' && tab.id !== 'git').map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            const isCenterAction = tab.id === 'onboarding'
            
            if (isCenterAction) {
              return (
                <button
                  key={tab.id}
                  id={`bottom-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className="relative -mt-3.5 flex flex-col items-center cursor-pointer transition-all duration-300 active:scale-95 group w-full"
                >
                  <div className={`w-13 h-13 rounded-full flex items-center justify-center bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-500 border border-violet-400/20 text-white shadow-[0_0_15px_rgba(124,58,237,0.5)] onboarding-center-btn ${
                    isActive ? 'scale-105 animate-pulse-glow' : 'animate-center-float'
                  }`}>
                    <Icon size={20} className="transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
                  </div>
                  <span className={`text-[9px] font-black tracking-wide mt-1.5 transition-colors duration-200 ${
                    isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                  }`}>{tab.shortLabel}</span>
                </button>
              )
            }

            return (
              <button
                key={tab.id}
                id={`bottom-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-0.5 py-2 rounded-xl transition-all duration-200 cursor-pointer w-full ${
                  isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-all duration-200 ${
                  isActive ? 'bg-indigo-500/15 shadow-[0_0_12px_rgba(99,102,241,0.2)]' : ''
                }`}>
                  <Icon size={18} />
                </div>
                <span className={`text-[9px] font-bold tracking-wide transition-all ${
                  isActive ? 'text-indigo-400' : 'text-[var(--color-text-muted)]'
                }`}>{tab.shortLabel}</span>
                {isActive && <div className="w-4 h-0.5 bg-indigo-400 rounded-full" />}
              </button>
            )
          })}
        </div>
      </nav>


      {/* Modal de Detalle y Gestión de Cliente (CRM) */}
      {activeMetricModal === 'clientes' && selectedCrmClientId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-md animate-fade-in p-4">
          <div className="relative w-full max-w-2xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl animate-scale-up space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <h3 className="font-black text-sm uppercase text-indigo-500 tracking-wider flex items-center gap-2">
                <Users size={16} />
                Gestionar Cliente: {selectedCrmClientId}
              </h3>
              <button 
                onClick={() => {
                  setActiveMetricModal(null)
                  setSelectedCrmClientId(null)
                }}
                className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text)] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Selector de Pestañas CRM */}
            <div className="flex border-b border-[var(--color-border)] pb-0.5 mb-2">
              <button
                onClick={() => setCrmTab('config')}
                className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  crmTab === 'config'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Configuración Operativa
              </button>
              <button
                onClick={() => {
                  setCrmTab('drift');
                  loadDriftData(selectedCrmClientId);
                }}
                className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                  crmTab === 'drift'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
                }`}
              >
                Sincronización Core (Drift)
              </button>
            </div>

            {crmTab === 'config' ? (
              <>
                <div className="space-y-4">
                  {/* Nicho de Mercado */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Nicho de Mercado / Vertical de Negocio</label>
                    <CustomSelect 
                      value={editNiche} 
                      onChange={(e) => setEditNiche(e.target.value)}
                      options={[
                        { id: "retail_clothing", name: "🛍️ Ropa y Retail Tradicional (retail_clothing)" },
                        { id: "technical_services", name: "⚙️ Tornerías y Mecanizado de Precisión (technical_services)" },
                        { id: "refrigeration_ac", name: "❄️ Refrigeración y Climatización (refrigeration_ac)" },
                        { id: "contractors", name: "📐 Contratistas y Construcción (contractors)" },
                        { id: "machinery_rental", name: "🚜 Alquiler de Maquinaria y Equipos (machinery_rental)" },
                        { id: "carpentry", name: "🪚 Carpinterías y Muebles (carpentry)" },
                        { id: "laundry", name: "🧺 Lavanderías y Tintorerías (laundry)" },
                        { id: "furniture_repair", name: "🛋️ Restauración y Tapicería de Muebles (furniture_repair)" },
                        { id: "wellness_podology", name: "💆 Estética, Podología y Bienestar (wellness_podology)" },
                        { id: "grocery_food", name: "🍎 Minimarkets y Alimentos (grocery_food)" }
                      ]}
                    />
                  </div>

                  {/* Modo de Facturación */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider block">Modelo de Cobro Base</label>
                    <CustomSelect
                      value={editBillingMode}
                      onChange={(val) => setEditBillingMode(val)}
                      options={[
                        { value: "percentage", label: "Porcentaje sobre Ventas (%)" },
                        { value: "fixed_per_service", label: "Monto Fijo por Servicio" },
                        { value: "flat_monthly", label: "Pago Mensual Fijo" }
                      ]}
                    />
                  </div>

                  {editBillingMode === 'percentage' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tasa de Comisión (%)</label>
                      <input 
                        type="number" 
                        value={editComisionPorcentaje} 
                        onChange={(e) => setEditComisionPorcentaje(parseFloat(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        step="0.1"
                      />
                    </div>
                  )}

                  {editBillingMode === 'fixed_per_service' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Monto Fijo por Servicio ($ COP)</label>
                      <input 
                        type="number" 
                        value={editMontoFijoServicio} 
                        onChange={(e) => setEditMontoFijoServicio(parseInt(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  {editBillingMode === 'flat_monthly' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Pago Mensual Fijo ($ COP)</label>
                      <input 
                        type="number" 
                        value={editPagoMensualFijo} 
                        onChange={(e) => setEditPagoMensualFijo(parseInt(e.target.value) || 0)}
                        className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                      />
                    </div>
                  )}

                  {/* Facturación Electrónica DIAN */}
                  <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                      <input 
                        type="checkbox" 
                        checked={editEnableDianBilling} 
                        onChange={(e) => setEditEnableDianBilling(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                      />
                      Habilitar Facturación Electrónica DIAN Directa
                    </label>

                    {editEnableDianBilling && (
                      <div className="space-y-1.5 animate-fade-in pl-6 border-l border-indigo-500/20">
                        <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Costo por Documento DIAN ($ COP)</label>
                        <input 
                          type="number" 
                          value={editCostoPorFacturaDian}
                          onChange={(e) => setEditCostoPorFacturaDian(parseFloat(e.target.value) || 0)}
                          className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs w-full max-w-[200px] text-[var(--color-text)] outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                  {/* Alerta Remota / Bloqueo del Sistema */}
                  <div className="p-4 bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-[var(--color-text-muted)] select-none">
                      <input 
                        type="checkbox" 
                        checked={editAlertActive} 
                        onChange={(e) => setEditAlertActive(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                      />
                      Habilitar Alerta Remota / Bloqueo Administrativo
                    </label>

                    {editAlertActive && (
                      <div className="space-y-3 animate-fade-in pl-6 border-l border-indigo-500/20">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Tipo de Alerta</label>
                          <CustomSelect
                            value={editAlertType}
                            onChange={(val) => setEditAlertType(val)}
                            options={[
                              { value: "info", label: "Información (Azul)" },
                              { value: "warning", label: "Advertencia (Naranja)" },
                              { value: "error", label: "Error / Bloqueante (Rojo)" }
                            ]}
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Título de la Alerta</label>
                          <input 
                            type="text" 
                            value={editAlertTitle} 
                            onChange={(e) => setEditAlertTitle(e.target.value)}
                            placeholder="Ej: Prueba de Enlace de Telemetría"
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full text-[var(--color-text)] outline-none focus:border-indigo-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-[var(--color-text-muted)] block">Mensaje de la Alerta</label>
                          <textarea 
                            value={editAlertMessage} 
                            onChange={(e) => setEditAlertMessage(e.target.value)}
                            placeholder="Mensaje de advertencia o bloqueo..."
                            className="bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs w-full h-20 text-[var(--color-text)] outline-none focus:border-indigo-500 resize-none"
                          />
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-[var(--color-text-muted)] select-none">
                          <input 
                            type="checkbox" 
                            checked={editAlertDismissible} 
                            onChange={(e) => setEditAlertDismissible(e.target.checked)}
                            className="w-3.5 h-3.5 rounded accent-indigo-600 bg-[var(--color-bg)] border border-[var(--color-border)] focus:ring-0 focus:outline-none"
                          />
                          Permitir al usuario cerrar el aviso (Dismissible)
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <button 
                    onClick={() => {
                      setActiveMetricModal(null)
                      setSelectedCrmClientId(null)
                    }}
                    className="px-4 py-2 bg-[var(--color-surface-2)] hover:bg-[var(--color-border)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={handleSaveCrmConfig}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold cursor-pointer shadow-lg active:scale-95 transition-all"
                  >
                    Guardar Configuración
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Panel de Sincronización Core (Drift) */}
                <div className="space-y-4">
                  {driftLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-2">
                      <RefreshCw size={24} className="animate-spin text-indigo-500" />
                      <span className="text-xs text-[var(--color-text-muted)]">Analizando desviación respecto al Core...</span>
                    </div>
                  ) : driftData ? (
                    <div className="space-y-4">
                      {/* Resumen de paridad */}
                      <div className="flex items-center justify-between bg-[var(--color-surface-2)]/30 border border-[var(--color-border)] rounded-2xl p-4">
                        <div>
                          <p className="text-xs font-black text-[var(--color-text)]">Índice de Paridad de Código</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Core de Referencia: <span className="font-mono font-bold text-indigo-400">{driftData.coreId}</span></p>
                        </div>
                        <span className={`text-xs font-black px-2.5 py-1 rounded-full ${
                          driftData.parityPercent >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {driftData.parityPercent}% Sincronizado
                        </span>
                      </div>

                      {/* Acciones Rápidas del Cliente */}
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const filesMap = {};
                            driftData.differences.forEach(diff => {
                              filesMap[diff.file] = !isFileSensitive(diff.file);
                            });
                            setBulkSyncFiles(filesMap);
                            setIsBulkSyncModalOpen(true);
                          }}
                          disabled={driftData.differences.length === 0}
                          className="py-2 bg-indigo-650/10 hover:bg-indigo-650/20 border border-indigo-500/25 text-indigo-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                          title="Sincronizar lote con Core"
                        >
                          <RefreshCw size={11} className="animate-pulse" />
                          Lote Core
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGitDiscard(selectedCrmClientId.toLowerCase(), null, true)}
                          disabled={driftData.differences.length === 0 || gitDiscardingFile === 'all'}
                          className="py-2 bg-red-650/10 hover:bg-red-650/20 border border-red-500/25 text-red-500 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.98]"
                          title="Descartar todas las modificaciones de Git"
                        >
                          <RotateCcw size={11} className={gitDiscardingFile === 'all' ? 'animate-spin' : ''} />
                          Limpiar Git
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeployClient(selectedCrmClientId, false)}
                          className="py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/25 text-emerald-400 text-[9px] font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1 active:scale-[0.98]"
                        >
                          <Activity size={11} />
                          Deploy Host
                        </button>
                      </div>

                      {/* Lista de desviaciones */}
                      <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
                        {driftData.differences.length === 0 ? (
                          <div className="text-center py-10 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                            <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                              <CheckCircle size={14} />
                              ¡Código 100% Alineado!
                            </p>
                            <p className="text-[10px] text-emerald-300/60 mt-1">Esta instancia de cliente no presenta desviaciones físicas con el Core.</p>
                          </div>
                        ) : (
                          driftData.differences.map((diff, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-[var(--color-surface-2)]/10 border border-[var(--color-border)] rounded-xl hover:bg-[var(--color-surface-2)]/20 transition-all">
                              <div className="space-y-0.5">
                                <p className="text-[11px] font-mono font-bold text-[var(--color-text)] break-all">{diff.file}</p>
                                <p className="text-[9px] text-[var(--color-text-muted)]">
                                  {diff.status === 'missing_in_client' ? '⚠️ Archivo ausente en cliente' : '✏️ Archivo modificado/desviado'}
                                </p>
                              </div>

                              <div className="flex items-center gap-1.5 shrink-0">
                                {diff.status === 'modified' && (
                                  <>
                                    <button
                                      onClick={() => handleGitDiff(selectedCrmClientId.toLowerCase(), diff.file)}
                                      className="h-6 px-1.5 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 border border-slate-700"
                                      title="Comparar cambios contra Git HEAD"
                                    >
                                      <Eye size={10} />
                                      Git Diff
                                    </button>
                                    <button
                                      onClick={() => handleGitDiscard(selectedCrmClientId.toLowerCase(), diff.file)}
                                      disabled={gitDiscardingFile === diff.file}
                                      className="h-6 px-1.5 bg-red-600/10 hover:bg-red-650/20 text-red-500 rounded-lg text-[9px] font-bold cursor-pointer flex items-center gap-1 disabled:opacity-40 border border-red-500/10"
                                      title="Descartar cambios en este archivo"
                                    >
                                      <RotateCcw size={10} className={gitDiscardingFile === diff.file ? 'animate-spin' : ''} />
                                      Deshacer
                                    </button>
                                  </>
                                )}
                                {diff.status === 'modified' && (
                                  <button
                                    onClick={() => setActiveDiffFile(diff)}
                                    className="h-6 px-2 bg-slate-800 hover:bg-slate-700 text-slate-350 rounded-lg text-[9px] font-bold cursor-pointer"
                                    title="Comparar contra plantilla Core"