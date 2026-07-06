import React, { useState } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { Upload, FileText, CheckCircle, AlertCircle, X, Trash2 } from 'lucide-react';
import { useAlertConfirm } from '../../common/AlertConfirmContext'; // Import hook for premium confirmation

// Recreación inline del componente
function CargadorPlanosCAD({
  onFilesSelected = null,
  allowedExtensions = ['.dxf', '.step', '.iges', '.pdf'],
  maxSizeMB = 25
}) {
  const [dragActive, setDragActive] = useState(false);
  const [filesList, setFilesList] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = React.useRef(null);
  const confirm = useAlertConfirm();

  const validateFile = (file) => {
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      return `Tipo de archivo no permitido. Extensiones válidas: ${allowedExtensions.join(', ')}`;
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `El archivo supera el tamaño máximo permitido de ${maxSizeMB} MB.`;
    }
    return null;
  };

  const handleFiles = (newFiles) => {
    const validFiles = [];
    let error = '';

    for (let i = 0; i < newFiles.length; i++) {
      const file = newFiles[i];
      const err = validateFile(file);
      if (err) {
        error = err;
      } else if (!filesList.some(f => f.name === file.name && f.size === file.size)) {
        validFiles.push({
          name: file.name,
          size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
          rawFile: file
        });
      }
    }

    if (error) {
      setErrorMsg(error);
    } else if (validFiles.length > 0) {
      const updatedList = [...filesList, ...validFiles];
      setFilesList(updatedList);
      setErrorMsg('');
      if (onFilesSelected) {
        onFilesSelected(updatedList.map(f => f.rawFile));
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  // Rule: Delete action MUST request useAlertConfirm modal confirmation
  const removeFile = async (indexToRemove, fileName) => {
    const confirmed = await confirm({
      title: 'Eliminar plano técnico',
      message: `¿Estás seguro de que deseas eliminar el plano "${fileName}" del pedido?`,
      variant: 'error',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar'
    });

    if (confirmed) {
      const updatedList = filesList.filter((_, index) => index !== indexToRemove);
      setFilesList(updatedList);
      if (onFilesSelected) {
        onFilesSelected(updatedList.map(f => f.rawFile));
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm">
      <h3 className="text-sm font-bold text-[var(--color-text)] mb-2 flex items-center gap-2">
        <FileText size={16} className="text-[var(--color-primary)]" />
        <span>Carga de Planos Técnicos</span>
      </h3>
      <p className="text-xs text-[var(--color-text-muted)] mb-4">
        Sube tus planos CAD en formato DXF, STEP, IGES o PDF para cotización inmediata.
      </p>

      {/* Zona de Drop */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full py-8 px-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          dragActive 
            ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 scale-[1.005]' 
            : 'border-[var(--color-border)] bg-[var(--color-surface-2)]/30 hover:border-[var(--color-primary)]/50 hover:bg-[var(--color-surface-2)]/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleChange}
          accept={allowedExtensions.join(',')}
        />
        <Upload size={32} className={`mb-3 transition-colors ${dragActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`} />
        <span className="text-xs font-bold text-[var(--color-text)] text-center">
          Arrastra tus planos aquí o haz clic para explorar
        </span>
        <span className="text-[10px] text-[var(--color-text-muted)] mt-1">
          Límite de {maxSizeMB} MB por archivo
        </span>
      </div>

      {/* Mensajes de Estado */}
      {errorMsg && (
        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl flex items-start gap-2 text-xs">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Lista de archivos */}
      {filesList.length > 0 && (
        <div className="mt-4 border-t border-[var(--color-border)] pt-4">
          <span className="text-[11px] font-bold text-[var(--color-text-muted)] block mb-2">
            Archivos Cargados ({filesList.length})
          </span>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {filesList.map((file, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-2.5 bg-[var(--color-surface-2)]/40 border border-[var(--color-border)] rounded-xl group/file"
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <FileText size={16} className="text-[var(--color-primary)] shrink-0" />
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-[var(--color-text)] truncate">
                      {file.name}
                    </span>
                    <span className="text-[9px] text-[var(--color-text-muted)]">
                      {file.size}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeFile(index, file.name); }}
                  className="w-5 h-5 rounded-md hover:bg-red-500/10 hover:text-red-500 text-[var(--color-text-muted)] flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CargadorPlanosCADSandbox() {
  const [maxSizeMB, setMaxSizeMB] = useState(25);
  const [selectedCount, setSelectedCount] = useState(0);

  return (
    <SandboxLayout
      title="Cargador de Planos CAD"
      description="Área de arrastre y carga para planos de ingeniería DXF, STEP, IGES y PDF con límites de tamaño."
      controls={[
        { label: 'Tamaño Máximo (MB)', type: 'select', value: maxSizeMB, options: [10, 25, 50, 100], onChange: setMaxSizeMB }
      ]}
    >
      <div className="py-6 flex flex-col items-center justify-center w-full">
        <CargadorPlanosCAD
          maxSizeMB={maxSizeMB}
          onFilesSelected={(files) => setSelectedCount(files.length)}
        />
        {selectedCount > 0 && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 text-green-500 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle size={14} />
            <span>Planos cargados listos para procesamiento ({selectedCount} archivos)</span>
          </div>
        )}
      </div>
    </SandboxLayout>
  );
}
