import React, { useRef, useState, useEffect } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { useAlertConfirm } from '../../common/AlertConfirmContext';
import { Shield, FileText, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

function ConsentimientoFirmaDigitalComponent({ onSign, docTitle, termsText }) {
  const { alertConfirm } = useAlertConfirm();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [nombreFirmante, setNombreFirmante] = useState('');
  const [scrolledToBottom, setScrolledToBottom] = useState(false);

  const defaultTerms = termsText || `Por medio de la presente, declaro que he sido informado de forma clara y detallada acerca del tratamiento podológico que se me realizará. Entiendo que los procedimientos clínicos incluyen el corte de uñas, desbridamiento de helomas (callosidades), fresado mecánico e instrumental punzante esterilizado.

Acepto que se me han explicado los posibles riesgos menores asociados (leves laceraciones, enrojecimiento temporal) y declaro bajo juramento que no he ocultado patologías críticas como pie diabético, hemofilia o problemas de coagulación severos en mi ficha de historial clínico.

Doy mi autorización libre y voluntaria para que el profesional staff a cargo realice el procedimiento indicado.`;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [scrolledToBottom]); // Re-inicializar cuando el canvas aparezca en el DOM

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasSigned(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = async () => {
    const confirm = await alertConfirm({
      title: '¿Borrar Firma?',
      message: '¿Está seguro de que desea limpiar el panel de firma? Perderá el trazo actual.',
      variant: 'warning'
    });

    if (confirm) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setHasSigned(false);
      setIsSaved(false);
    }
  };

  const handleSaveSignature = (e) => {
    e.preventDefault();
    if (!hasSigned || !nombreFirmante) return;

    setIsSaved(true);
    if (onSign) {
      const canvas = canvasRef.current;
      onSign({
        nombre: nombreFirmante,
        firma: canvas.toDataURL(),
        fecha: new Date().toLocaleDateString()
      });
    }
  };

  const handleScroll = (e) => {
    const target = e.target;
    const reachedBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 10;
    if (reachedBottom) {
      setScrolledToBottom(true);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg overflow-hidden transition-all duration-300">
      
      {/* Cabecera */}
      <div className="p-4 border-b border-[var(--color-border)] bg-gradient-to-r from-[var(--color-primary-light)] to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-[var(--color-text)]">{docTitle || 'Consentimiento Informado'}</h3>
            <p className="text-[9px] text-[var(--color-text-muted)]">Firma de autorización de procedimientos</p>
          </div>
        </div>
        <Shield className="w-4 h-4 text-[var(--color-primary)]" />
      </div>

      {isSaved ? (
        <div className="p-8 text-center flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h4 className="text-xs font-bold text-[var(--color-text)]">Documento Firmado</h4>
          <p className="text-[10px] text-[var(--color-text-muted)] max-w-xs mx-auto leading-relaxed">
            El consentimiento legal ha sido sellado para el paciente <strong>{nombreFirmante}</strong> el {new Date().toLocaleDateString()}.
          </p>
          
          <button
            onClick={() => {
              setIsSaved(false);
              setHasSigned(false);
              setScrolledToBottom(false);
            }}
            className="mt-2 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-[10px] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3 h-3" /> Firmar de Nuevo
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          
          {/* Caja de Términos */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-black text-[var(--color-text-muted)] uppercase tracking-wider">
              Términos del Acuerdo (Deslice abajo para habilitar firma)
            </label>
            <div 
              onScroll={handleScroll}
              className="h-28 overflow-y-auto p-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-[10px] text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line"
            >
              {defaultTerms}
            </div>
            
            {!scrolledToBottom && (
              <span className="text-[9px] text-amber-500 font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Deslice al final del texto.
              </span>
            )}
          </div>

          <div className={`space-y-4 transition-all duration-300 ${!scrolledToBottom ? 'opacity-40 pointer-events-none' : ''}`}>
            {/* Nombre Firmante */}
            <div>
              <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase mb-1">Nombre del Paciente</label>
              <input
                type="text"
                value={nombreFirmante}
                onChange={(e) => setNombreFirmante(e.target.value)}
                placeholder="Ej. Juan Carlos Restrepo"
                className="w-full px-3 py-1.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-xs text-[var(--color-text)] focus:border-[var(--color-primary)] outline-none transition-all"
              />
            </div>

            {/* Canvas de Dibujo */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-[9px] font-black text-[var(--color-text-muted)] uppercase">Firma Manuscrita</label>
                {hasSigned && (
                  <button 
                    type="button" 
                    onClick={clearCanvas}
                    className="text-[9px] font-black uppercase text-red-500 hover:underline cursor-pointer"
                  >
                    Borrar Firma
                  </button>
                )}
              </div>

              <div className="border border-[var(--color-border)] rounded-xl overflow-hidden bg-white relative">
                <canvas
                  ref={canvasRef}
                  width={400}
                  height={120}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-[120px] cursor-crosshair touch-none"
                />
                {!hasSigned && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                    Dibuja tu firma aquí
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleSaveSignature}
              disabled={!hasSigned || !nombreFirmante}
              className="w-full py-2 rounded-xl bg-[var(--color-primary)] !text-white text-xs font-black uppercase tracking-wider shadow-md hover:bg-[var(--color-primary-dark)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              Aceptar y Firmar Acuerdo
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

export default function ConsentimientoFirmaDigitalSandbox() {
  return (
    <SandboxLayout
      title="Consentimiento Informado y Firma Digital"
      description="Lienzo Canvas interactivo para firma con scroll legal de seguridad obligatorio"
    >
      <ConsentimientoFirmaDigitalComponent />
    </SandboxLayout>
  );
}
