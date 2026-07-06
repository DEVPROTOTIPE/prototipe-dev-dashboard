import React, { useState, useRef, useCallback, useEffect } from 'react';

// ── CARD COMPONENT ──────────────────────────────────────────────────────────
function CreditCardFlip({ number, name, expiry, cvv, rotationY, cardType, isDragging }) {
  const logo = cardType === 'mastercard' ? 'Mastercard' : cardType === 'amex' ? 'Amex' : 'Visa';
  const formatted = number.padEnd(16, '•').replace(/(.{4})/g, '$1 ').trim();

  const containerStyle = {
    width: '320px',
    height: '190px',
    perspective: '1200px',
    WebkitPerspective: '1200px',
    margin: '0 auto',
    userSelect: 'none',
    cursor: isDragging ? 'grabbing' : 'grab',
    flexShrink: 0,
  };

  const innerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    transformStyle: 'preserve-3d',
    WebkitTransformStyle: 'preserve-3d',
    transform: `rotateY(${rotationY}deg)`,
    WebkitTransform: `rotateY(${rotationY}deg)`,
    transition: isDragging ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const faceBase = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    borderRadius: '16px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
    backfaceVisibility: 'hidden',
    WebkitBackfaceVisibility: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    color: 'white',
    overflow: 'hidden',
  };

  const frontStyle = {
    ...faceBase,
    background: 'linear-gradient(135deg, #3f3f46 0%, #09090b 100%)',
    padding: '20px',
    border: '1px solid rgba(255,255,255,0.12)',
  };

  const backStyle = {
    ...faceBase,
    background: 'linear-gradient(135deg, #27272a 0%, #09090b 100%)',
    paddingTop: '20px',
    paddingBottom: '20px',
    border: '1px solid rgba(255,255,255,0.08)',
    transform: 'rotateY(180deg)',
    WebkitTransform: 'rotateY(180deg)',
  };

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        {/* FRENTE */}
        <div style={frontStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ width: '48px', height: '32px', background: 'rgba(245,158,11,0.25)', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)' }} />
            <span style={{ fontSize: '13px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '2px', opacity: 0.85 }}>{logo}</span>
          </div>
          <div style={{ fontFamily: 'monospace', fontSize: '17px', fontWeight: 700, letterSpacing: '3px', textAlign: 'center' }}>
            {formatted}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ minWidth: 0, paddingRight: '8px' }}>
              <span style={{ display: 'block', fontSize: '8px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px' }}>Titular</span>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name || 'NOMBRE TITULAR'}
              </span>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <span style={{ display: 'block', fontSize: '8px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px' }}>Vence</span>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '1px' }}>{expiry || 'MM/AA'}</span>
            </div>
          </div>
        </div>

        {/* REVERSO */}
        <div style={backStyle}>
          <div style={{ width: '100%', height: '40px', background: '#3f3f46', flexShrink: 0 }} />
          <div style={{ padding: '0 20px' }}>
            <div style={{ textAlign: 'right', fontSize: '8px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>CVV / Firma</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', padding: '8px', height: '36px' }}>
              <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '100%', borderRadius: '4px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                <span style={{ fontSize: '10px', color: '#71717a', fontFamily: 'monospace', letterSpacing: '3px' }}>••••••••••••</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 900, fontFamily: 'monospace', letterSpacing: '2px', color: '#fbbf24', paddingLeft: '12px', paddingRight: '4px' }}>{cvv || '•••'}</span>
            </div>
          </div>
          <div style={{ padding: '0 20px', fontSize: '8px', color: '#52525b', textAlign: 'center', lineHeight: 1.5 }}>
            Esta tarjeta es personal e intransferible. Uso sujeto a condiciones de la plataforma.
          </div>
        </div>
      </div>
    </div>
  );
}

// ── HOOK DE ARRASTRE ────────────────────────────────────────────────────────
function useDragRotate(initialRotation = 0) {
  const [rotationY, setRotationY] = useState(initialRotation);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startRotation: 0, active: false, lastX: 0, velocity: 0 });

  const startDrag = useCallback((clientX) => {
    dragRef.current = { startX: clientX, startRotation: rotationY, active: true, lastX: clientX, velocity: 0 };
    setIsDragging(true);
  }, [rotationY]);

  const moveDrag = useCallback((clientX) => {
    if (!dragRef.current.active) return;
    const delta = clientX - dragRef.current.startX;
    dragRef.current.velocity = clientX - dragRef.current.lastX;
    dragRef.current.lastX = clientX;
    // Sensibilidad: 0.4° por px
    setRotationY(dragRef.current.startRotation + delta * 0.4);
  }, []);

  const endDrag = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    setIsDragging(false);

    // Snap al múltiplo de 180° más cercano según velocidad e inercia
    const velocity = dragRef.current.velocity;
    setRotationY(prev => {
      const normalized = ((prev % 360) + 360) % 360;
      // Determinar cara más cercana con influencia de velocidad
      let target;
      if (velocity > 3) {
        // Impulso a la derecha → ir al siguiente "frente"
        target = Math.ceil(prev / 180) * 180;
      } else if (velocity < -3) {
        // Impulso a la izquierda → ir al siguiente "reverso"
        target = Math.floor(prev / 180) * 180;
      } else {
        // Snap al más cercano
        target = Math.round(prev / 180) * 180;
      }
      return target;
    });
  }, []);

  // Mouse events
  const onMouseDown = useCallback((e) => { e.preventDefault(); startDrag(e.clientX); }, [startDrag]);

  useEffect(() => {
    const onMouseMove = (e) => moveDrag(e.clientX);
    const onMouseUp = () => endDrag();
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isDragging, moveDrag, endDrag]);

  // Touch events
  const onTouchStart = useCallback((e) => { startDrag(e.touches[0].clientX); }, [startDrag]);
  const onTouchMove = useCallback((e) => { e.preventDefault(); moveDrag(e.touches[0].clientX); }, [moveDrag]);
  const onTouchEnd = useCallback(() => endDrag(), [endDrag]);

  // Determinar si estamos viendo el reverso (cualquier múltiplo impar de 180)
  const normalizedDeg = ((rotationY % 360) + 360) % 360;
  const isShowingBack = normalizedDeg > 90 && normalizedDeg < 270;

  return { rotationY, isDragging, isShowingBack, onMouseDown, onTouchStart, onTouchMove, onTouchEnd, setRotationY };
}

// ── SANDBOX ─────────────────────────────────────────────────────────────────
export default function CreditCardInteractiveFlipSandbox() {
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardType, setCardType] = useState('visa');

  const { rotationY, isDragging, isShowingBack, onMouseDown, onTouchStart, onTouchMove, onTouchEnd, setRotationY } = useDragRotate(0);

  const flipTo = (back) => {
    // Calcular el 180° más cercano en la dirección correcta
    const current = rotationY;
    const base = Math.round(current / 360) * 360;
    setRotationY(back ? base + 180 : base);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div>
        <h4 style={{ fontSize: '12px', fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>CreditCardInteractiveFlip</h4>
        <p style={{ fontSize: '10px', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.5 }}>
          Arrastra la tarjeta horizontalmente para girarla en 3D.
        </p>
      </div>

      {/* Preview Area — overflow: visible crítico */}
      <div style={{
        minHeight: '240px',
        background: 'var(--color-bg)',
        border: '1px dashed var(--color-border)',
        borderRadius: '16px',
        padding: '32px 20px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        overflow: 'visible',
        position: 'relative',
      }}>
        <span style={{ position: 'absolute', top: '8px', left: '12px', fontSize: '8px', fontFamily: 'monospace', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '2px' }}>
          preview
        </span>

        {/* Zona de arrastre — captura events sin propagar */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{ touchAction: 'none', overflow: 'visible' }}
        >
          <CreditCardFlip
            number={number}
            name={name}
            expiry={expiry}
            cvv={cvv}
            rotationY={rotationY}
            cardType={cardType}
            isDragging={isDragging}
          />
        </div>

        {/* Hint de arrastre */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px', opacity: 0.4 }}>←</span>
          <span style={{ fontSize: '9px', color: 'var(--color-text-muted)', letterSpacing: '1px', fontFamily: 'monospace' }}>
            {isDragging ? 'GIRANDO...' : 'ARRASTRA PARA GIRAR'}
          </span>
          <span style={{ fontSize: '18px', opacity: 0.4 }}>→</span>
        </div>
      </div>

      {/* Botones de flip rápido */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {[
          { label: '↩ Mostrar Frente', back: false },
          { label: '↪ Mostrar Reverso', back: true },
        ].map(({ label, back }) => (
          <button
            key={label}
            type="button"
            onClick={() => flipTo(back)}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: 700,
              border: '1px solid var(--color-border)',
              background: isShowingBack === back ? 'var(--color-primary)' : 'var(--color-surface-2)',
              color: isShowingBack === back ? 'white' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Controles de Marca */}
      <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '14px' }}>
        <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '3px', color: '#818cf8', display: 'block', marginBottom: '8px' }}>Marca</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
          {['visa', 'mastercard', 'amex'].map((brand) => (
            <button key={brand} type="button" onClick={() => setCardType(brand)} style={{ padding: '5px', borderRadius: '8px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', border: '1px solid', cursor: 'pointer', background: cardType === brand ? 'var(--color-primary)' : 'var(--color-surface-2)', color: cardType === brand ? 'white' : 'var(--color-text-muted)', borderColor: cardType === brand ? 'var(--color-primary)' : 'var(--color-border)' }}>
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario */}
      <div style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {[
          { label: 'Número', value: number, onChange: (v) => setNumber(v.replace(/\D/g, '')), maxLength: 16, placeholder: '4000 1234 5678 9010', onFocus: () => flipTo(false) },
          { label: 'Titular', value: name, onChange: setName, placeholder: 'JUAN PEREZ', onFocus: () => flipTo(false) },
        ].map(({ label, value, onChange, maxLength, placeholder, onFocus }) => (
          <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>{label}</label>
            <input type="text" maxLength={maxLength} value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder={placeholder}
              style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '12px', outline: 'none' }} />
          </div>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>Expiración</label>
            <input type="text" maxLength={5} value={expiry} onChange={(e) => setExpiry(e.target.value)} onFocus={() => flipTo(false)} placeholder="MM/AA"
              style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '12px', outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <label style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', letterSpacing: '1px' }}>
              CVV <span style={{ color: '#f59e0b' }}>← voltea</span>
            </label>
            <input type="text" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))} onFocus={() => flipTo(true)} onBlur={() => flipTo(false)} placeholder="123"
              style={{ height: '34px', padding: '0 10px', borderRadius: '8px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: '12px', outline: 'none' }} />
          </div>
        </div>
      </div>

      {/* Debug: ángulo actual */}
      <div style={{ textAlign: 'center', fontSize: '10px', fontFamily: 'monospace', color: 'var(--color-text-muted)', opacity: 0.5 }}>
        rotateY: {Math.round(rotationY)}° · {isShowingBack ? 'Reverso' : 'Frente'}
      </div>
    </div>
  );
}
