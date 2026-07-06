import React, { useState, useRef } from 'react';
import { SandboxLayout } from './SandboxLayout';
import { motion } from 'framer-motion';
import { UploadCloud, File, CheckCircle2 } from 'lucide-react';

// Componente Local para simulación autónoma en el sandbox
function LocalDragAndDropZone({
  onFilesDropped,
  acceptedTypes = '*/*',
  maxSizeMB = 5,
  multiple = false,
  className = ''
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFiles = (fileList) => {
    const validFiles = Array.from(fileList).filter(
      (file) => file.size <= maxSizeMB * 1024 * 1024
    );
    
    setFiles(validFiles);
    if (onFilesDropped) {
      onFilesDropped(validFiles);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <motion.div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        animate={{
          scale: isDragActive ? 1.02 : 1,
          borderColor: isDragActive ? 'var(--color-primary)' : 'var(--color-border)'
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className={`relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed bg-[var(--color-surface)] text-center transition-colors cursor-pointer ${
          isDragActive ? 'bg-[var(--color-primary)]/5 border-[var(--color-primary)]' : ''
        }`}
        onClick={handleButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleInputChange}
        />

        {files.length === 0 ? (
          <>
            <div className="p-3 bg-[var(--color-surface-2)] rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--color-text)]">
              Arrastra tus archivos aquí o haz click
            </p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Máximo {maxSizeMB}MB por archivo ({acceptedTypes === '*/*' ? 'cualquier tipo' : acceptedTypes})
            </p>
          </>
        ) : (
          <div className="space-y-3 w-full">
            <div className="flex items-center justify-center space-x-2 text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Cargado con éxito</span>
            </div>
            <div className="max-w-xs mx-auto divide-y divide-[var(--color-border)] bg-[var(--color-surface-2)] p-2.5 rounded-xl border border-[var(--color-border)]">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between text-left p-1 text-xs">
                  <div className="flex items-center min-w-0 pr-2">
                    <File className="w-4 h-4 text-[var(--color-text-muted)] mr-2 shrink-0" />
                    <span className="text-[var(--color-text)] truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-[var(--color-text-muted)] shrink-0 font-mono">
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function DragAndDropZoneSandbox() {
  const [droppedFiles, setDroppedFiles] = useState([]);
  const [multiple, setMultiple] = useState(false);
  const [maxSize, setMaxSize] = useState(5);

  const handleFilesDropped = (files) => {
    setDroppedFiles(files);
  };

  const handleReset = () => {
    setDroppedFiles([]);
  };

  return (
    <SandboxLayout
      title="DragAndDropZone"
      description="Zona interactiva de carga de archivos que reacciona visualmente mediante físicas elásticas y bordes dinámicos al arrastrar elementos."
      controls={
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Selección Múltiple
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setMultiple(true); handleReset(); }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  multiple
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                }`}
              >
                Permitir
              </button>
              <button
                onClick={() => { setMultiple(false); handleReset(); }}
                className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                  !multiple
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                }`}
              >
                Individual
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
              Tamaño Máximo
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[2, 5, 10].map((size) => (
                <button
                  key={size}
                  onClick={() => { setMaxSize(size); handleReset(); }}
                  className={`py-1.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
                    maxSize === size
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                      : 'bg-[var(--color-surface-2)] text-[var(--color-text-muted)] border-[var(--color-border)] hover:bg-[var(--color-surface-3)]'
                  }`}
                >
                  {size}MB
                </button>
              ))}
            </div>
          </div>

          {droppedFiles.length > 0 && (
            <button
              onClick={handleReset}
              className="w-full py-2 px-4 rounded-xl text-xs font-bold bg-[var(--color-surface-3)] text-[var(--color-text)] border border-[var(--color-border)] hover:bg-[var(--color-surface-4)] transition-all"
            >
              Limpiar Archivos
            </button>
          )}
        </div>
      }
    >
      <div className="w-full max-w-md mx-auto space-y-4">
        <LocalDragAndDropZone
          onFilesDropped={handleFilesDropped}
          maxSizeMB={maxSize}
          multiple={multiple}
          acceptedTypes="image/*,application/pdf"
        />

        <div className="p-3 bg-[var(--color-surface-2)] rounded-lg border border-[var(--color-border)] text-xs text-[var(--color-text-muted)] space-y-1">
          <strong className="text-[var(--color-text)] font-semibold">Tipos aceptados en esta demo:</strong>
          <p>Imágenes (.png, .jpg) o documentos PDF (.pdf).</p>
        </div>
      </div>
    </SandboxLayout>
  );
}
