import React from 'react'

/**
 * 🐙 Icono Oficial de GitHub (Isotipo)
 * Estándar: 24x24 viewBox, fill-current
 */
export const GithubIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
  </svg>
)

/**
 * 💬 Icono Oficial de WhatsApp (Isotipo Simétrico)
 * Estándar: 24x24 viewBox, fill-current
 */
export const WhatsappIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M19.07 4.93a10 10 0 0 0-16.28 11.56l-1.29 4.7 4.82-1.26A10 10 0 0 0 19.07 4.93zm-7.07 13.57a8.5 8.5 0 0 1-4.33-1.19l-.31-.18-2.86.75.76-2.79-.2-.32a8.52 8.52 0 0 1 12.27-10.74 8.5 8.5 0 0 1-5.33 14.47z M15.65 12.78c-.22-.11-1.3-.64-1.5-.71-.2-.08-.35-.12-.5.12-.15.23-.58.73-.71.88-.13.15-.26.17-.48.06a6.11 6.11 0 0 1-3.6-3.15c-.19-.32.19-.3.54-.99.06-.11.03-.21-.01-.3-.05-.09-.5-1.22-.68-1.67-.18-.44-.36-.38-.5-.38H7.7c-.15 0-.4.06-.6.28A2.66 2.66 0 0 0 6.27 9c0 1.54 1.12 3 1.28 3.23a12.72 12.72 0 0 0 4.87 4.3 15.6 15.6 0 0 0 1.62.6c.43.14.83.12 1.15.07.35-.05 1.09-.45 1.24-.88.16-.43.16-.8 1.1-.88-.08.08-.29-.08-.5-.2z"/>
  </svg>
)

/**
 * 🌐 Icono Oficial de Google (Multicolor Real)
 * Estándar: 24x24 viewBox, colores nativos vectoriales
 */
export const GoogleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C4 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.2-.6-.35-1.25-.35-1.85z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 4 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

/**
 * 🔥 Icono Oficial de Firebase (Multicolor Real)
 * Estándar: 24x24 viewBox, colores nativos vectoriales
 */
export const FirebaseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFCA28" d="M3.89 19.46L2.34 8.75c-.12-.86.72-1.46 1.45-1.03l13.14 7.69z"/>
    <path fill="#F57C00" d="M19.14 20l1.55-10.71c.12-.86-.72-1.46-1.45-1.03l-13.14 7.69z"/>
    <path fill="#DD2C00" d="M3.89 19.46l8.11-13.12c.32-.51 1.08-.51 1.4 0l8.11 13.12z"/>
  </svg>
)

/**
 * 💳 Icono Oficial de Stripe (S Estilizada)
 * Estándar: 24x24 viewBox, fill-current
 */
export const StripeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.93 11.23c-1.84-.77-3.3-1.22-3.3-2.14 0-.82.78-1.29 2.1-1.29 1.23 0 2.81.47 4.09 1.13l1.32-3.03C16.82 5.2 14.98 4.7 12.75 4.7 9.1 4.7 6.8 6.7 6.8 9.9c0 3.5 2.9 4.9 5.4 6 2.02.87 3.03 1.37 3.03 2.2 0 .88-.97 1.32-2.46 1.32-1.58 0-3.56-.66-5.06-1.5l-1.34 3.08c1.58.88 3.91 1.41 6.37 1.41 3.9 0 6.33-2 6.33-5.38.01-3.7-3.01-5-5.64-6.1z"/>
  </svg>
)

/**
 * 🏦 Isotipo Oficial de Rombos de la DIAN (Colombia)
 * Estándar: 24x24 viewBox, colores nativos vectoriales
 */
export const DianIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {/* Rombo Izquierdo (Azul Corporativo) */}
    <path fill="#005B82" d="M9.5 4L4 12l5.5 8L15 12 9.5 4z" />
    {/* Rombo Derecho (Verde Oliva DIAN) */}
    <path fill="#85B81B" d="M14.5 4L9 12l5.5 8 5.5-8L14.5 4z" />
    {/* Intersección Central (Azul Oscuro de cruce) */}
    <path fill="#004562" d="M12 7.6L9.5 12l2.5 4.4 2.5-4.4L12 7.6z" />
  </svg>
)

/**
 * 💳 Icono Oficial de Visa (Centrado y Proporcional)
 * Estándar: 24x24 viewBox, color de la marca corporativa
 */
export const VisaIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path fill="#1A1F71" d="M21.2 8.1h-1.8c-.6 0-1 .2-1.2.7l-3.4 8.2h2.4l.5-1.3h2.9l.3 1.3h2.1L21.2 8.1zm-2.8 5.8c.2-.4 1.2-3.3 1.2-3.3l.1.3.7 3h-2zm-9.3-5.8H6.8l-1.4 9h2.3l1.4-9zm-4.7 0H1.1l-.1.1c2.4.6 4.4 1.8 5.4 3.1l-.3 1.6 2.3-6.4H11.2l-3.7 9H5.1l-2.7-7.4z"/>
  </svg>
)

/**
 * 💳 Icono Oficial de MasterCard (Círculos Sólidos Solapados)
 * Estándar: 24x24 viewBox, colores nativos sin transparencias
 */
export const MastercardIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className}`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    {/* Círculo Rojo */}
    <circle cx="9" cy="12" r="6" fill="#EB001B" />
    {/* Círculo Amarillo */}
    <circle cx="15" cy="12" r="6" fill="#F79E1B" />
    {/* Intersección Naranja Sólida */}
    <path fill="#FF5F00" d="M12 17.2a5.98 5.98 0 0 1-3-5.2c0-2 1.2-3.8 3-4.8 1.8 1 3 2.8 3 4.8 0 2-1.2 3.8-3 4.8z" />
  </svg>
)

/**
 * 🍏 Icono Oficial de Apple (Isotipo)
 * Estándar: 24x24 viewBox, fill-current
 */
export const AppleIcon = ({ className = "w-4 h-4" }) => (
  <svg className={`${className} fill-current`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.17.67-2.88 1.49-.6.69-1.12 1.83-.98 2.95 1.1.09 2.21-.57 2.87-1.38z"/>
  </svg>
)
