import React from 'react';
import { SandboxLayout } from './SandboxLayout';
import HybridLoginPage from '../../common/HybridLoginPage';

export default function LoginPageSandbox() {
  return (
    <SandboxLayout
      title="HybridLoginPage"
      description="Módulo de autenticación híbrido. Combina inicio de sesión para Clientes mediante código de verificación (OTP SMS) y acceso para el Equipo mediante Correo/Contraseña, todo con micro-interacciones suaves y glassmorphism."
    >
      <div className="w-full max-w-lg mx-auto">
        <HybridLoginPage />
      </div>
    </SandboxLayout>
  );
}
