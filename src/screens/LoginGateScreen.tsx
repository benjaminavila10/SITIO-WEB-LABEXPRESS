import React, { useState } from 'react';
import { AlertCircle, Lock, ShieldCheck, Stethoscope, UserPlus } from 'lucide-react';
import { CLINICAL_ASSETS } from '../data/clinicalData';
import { AuthUser } from '../types';
import { ClinicalImage } from '../components/ClinicalImage';

interface LoginGateScreenProps {
  onAuthenticated: (token: string, user: AuthUser) => void;
  onRequestTensPortal: () => void;
}

type AuthMode = 'login' | 'register';

export const LoginGateScreen: React.FC<LoginGateScreenProps> = ({
  onAuthenticated,
  onRequestTensPortal,
}) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rut, setRut] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const endpoint =
        mode === 'login' ? '/api/auth/patient/login' : '/api/auth/patient/register';
      const payload =
        mode === 'login'
          ? { identifier, password }
          : { name, rut, email, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        token?: string;
        user?: AuthUser;
        error?: string;
      };

      if (!response.ok || !data.token || !data.user) {
        setErrorMessage(data.error || 'No se pudo completar la autenticación.');
        return;
      }

      onAuthenticated(data.token, data.user);
    } catch {
      setErrorMessage('Error de conexión con el servidor de LabExpress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#142132] flex flex-col">
      <header className="bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-6">
          <span className="font-display text-xl font-bold tracking-tight text-[#003366] whitespace-nowrap shrink-0">
            LabExpress
          </span>

          <nav aria-label="Acceso rápido" className="flex items-center gap-6">
            <a
              href="#portal-tens"
              data-path="portal-tens"
              onClick={(e) => {
                e.preventDefault();
                onRequestTensPortal();
              }}
              className="inline-flex items-center gap-2 text-[15px] md:text-base font-semibold text-[#006497] hover:text-[#003366] hover:underline underline-offset-4 whitespace-nowrap shrink-0 clinical-focus rounded px-2 py-2"
            >
              <Stethoscope className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Acceso Técnico TENS</span>
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-5 md:px-8 py-8 md:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left 6 Cols: Clinical Context & Photograph */}
        <section className="lg:col-span-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <p className="text-base font-semibold text-[#006497]">
              Portal Seguro de Pacientes · Chile
            </p>
            <h1 className="font-display text-[30px] leading-[38px] md:text-[40px] md:leading-[48px] font-bold tracking-[-0.02em] text-[#001e40] text-balance">
              Inicia sesión para agendar tu toma de muestra a domicilio
            </h1>
            <p className="text-[18px] leading-[28px] text-[#43474f] max-w-[58ch]">
              Protegemos tus datos clínicos, tu RUT y tus órdenes de exámenes mediante sesión
              verificada antes de acceder al catálogo y al pago con Webpay Plus.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden border border-[#e2e8f0] bg-white min-h-[260px] lg:flex-1">
            <ClinicalImage
              src={CLINICAL_ASSETS.heroHomeVisit}
              alt="Técnico TENS de LabExpress preparando toma de muestra clínica en domicilio"
              className="w-full h-full object-cover"
              fallbackTitle="LabExpress Atención Clínica a Domicilio"
            />
          </div>
        </section>

        {/* Right 6 Cols: Patient Login / Register Card */}
        <section className="lg:col-span-6 flex items-center">
          <div className="clinical-card w-full rounded-2xl p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-bold text-[#001e40]">
                  {mode === 'login' ? 'Ingreso de Paciente' : 'Crear Cuenta de Paciente'}
                </h2>
                <p className="text-base text-[#43474f]">
                  {mode === 'login'
                    ? 'Accede con tu correo o RUT registrado.'
                    : 'Regístrate en segundos para agendar tu visita.'}
                </p>
              </div>
              <ShieldCheck className="w-7 h-7 text-[#196f3d] shrink-0" aria-hidden="true" />
            </div>

            {/* Segmented Mode Switch */}
            <div
              role="tablist"
              aria-label="Modo de acceso"
              className="grid grid-cols-2 gap-1.5 bg-[#edeeef] p-1.5 rounded-xl"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'login'}
                onClick={() => {
                  setMode('login');
                  setErrorMessage(null);
                }}
                className={`min-h-[44px] rounded-lg text-base font-semibold transition-colors cursor-pointer clinical-focus ${
                  mode === 'login' ? 'bg-white text-[#003366] shadow-sm' : 'text-[#43474f]'
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'register'}
                onClick={() => {
                  setMode('register');
                  setErrorMessage(null);
                }}
                className={`min-h-[44px] rounded-lg text-base font-semibold transition-colors cursor-pointer clinical-focus ${
                  mode === 'register' ? 'bg-white text-[#003366] shadow-sm' : 'text-[#43474f]'
                }`}
              >
                Crear Cuenta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' ? (
                <>
                  <div>
                    <label
                      htmlFor="reg-name"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      Nombre completo
                    </label>
                    <input
                      id="reg-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Carmen Gloria Valdés"
                      className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="reg-rut"
                        className="block text-base font-semibold text-[#142132] mb-1.5"
                      >
                        RUT
                      </label>
                      <input
                        id="reg-rut"
                        type="text"
                        required
                        value={rut}
                        onChange={(e) => setRut(e.target.value)}
                        placeholder="12.345.678-9"
                        className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white font-mono text-base tabular-nums text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="reg-email"
                        className="block text-base font-semibold text-[#142132] mb-1.5"
                      >
                        Correo electrónico
                      </label>
                      <input
                        id="reg-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="paciente@correo.cl"
                        className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label
                    htmlFor="login-identifier"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    Correo electrónico o RUT
                  </label>
                  <input
                    id="login-identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="paciente@correo.cl o 12.345.678-9"
                    className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="auth-password"
                  className="block text-base font-semibold text-[#142132] mb-1.5"
                >
                  Contraseña
                </label>
                <input
                  id="auth-password"
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                />
              </div>

              {errorMessage && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#fdedeb] border border-[#e0564c] p-3.5 flex items-start gap-2.5 text-sm font-semibold text-[#9e2b25]"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[54px] px-6 rounded-[10px] bg-[#003366] text-white font-display font-bold text-[18px] hover:bg-[#001e40] disabled:opacity-60 transition-colors flex items-center justify-center gap-2.5 cursor-pointer clinical-focus"
              >
                {mode === 'login' ? (
                  <Lock className="w-5 h-5 shrink-0" aria-hidden="true" />
                ) : (
                  <UserPlus className="w-5 h-5 shrink-0" aria-hidden="true" />
                )}
                <span>
                  {isSubmitting
                    ? 'Verificando...'
                    : mode === 'login'
                    ? 'Ingresar a LabExpress'
                    : 'Registrarme e Ingresar'}
                </span>
              </button>
            </form>

            {mode === 'login' && (
              <p className="text-sm text-center text-[#43474f]">
                ¿Primera vez en LabExpress?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setErrorMessage(null);
                  }}
                  className="font-bold text-[#006497] hover:underline cursor-pointer"
                >
                  Crea tu cuenta de paciente aquí
                </button>
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};
