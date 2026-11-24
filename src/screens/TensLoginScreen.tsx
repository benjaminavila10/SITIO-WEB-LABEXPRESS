import React, { useEffect, useState } from 'react';
import { AlertCircle, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { CLINICAL_ASSETS } from '../data/clinicalData';
import { AuthUser, TensAuthStatus } from '../types';
import { ClinicalImage } from '../components/ClinicalImage';

interface TensLoginScreenProps {
  onTensAuthenticated: (token: string, user: AuthUser) => void;
  onNavigatePatients: () => void;
}

export const TensLoginScreen: React.FC<TensLoginScreenProps> = ({
  onTensAuthenticated,
  onNavigatePatients,
}) => {
  const [status, setStatus] = useState<TensAuthStatus | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [operatorName, setOperatorName] = useState('Camila Rojas Mendoza');
  const [sisCode, setSisCode] = useState('SIS-48210');
  const [passcode, setPasscode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/status')
      .then((res) => res.json())
      .then((data: TensAuthStatus) => {
        if (!active) return;
        setStatus(data);
        if (data.claimedSisCode) {
          setSisCode(data.claimedSisCode);
        }
      })
      .catch(() => {
        if (!active) return;
        setStatus({ envPasscodeActive: false, tensConfigured: false, claimedSisCode: null });
      })
      .finally(() => {
        if (active) setIsLoadingStatus(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const isFirstRunSetup = status !== null && !status.tensConfigured;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const endpoint = isFirstRunSetup ? '/api/auth/tens/claim' : '/api/auth/tens/login';
      const payload = isFirstRunSetup
        ? { name: operatorName, sisCode, passcode }
        : { sisCode, passcode };

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
        setErrorMessage(data.error || 'No se pudo validar el acceso operativo TENS.');
        return;
      }

      onTensAuthenticated(data.token, data.user);
    } catch {
      setErrorMessage('Error de conexión al validar credenciales TENS.');
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

          <nav aria-label="Navegación acceso TENS" className="flex items-center gap-6">
            <a
              href="#portal-pacientes"
              data-path="portal-pacientes"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePatients();
              }}
              className="text-[15px] md:text-base font-semibold text-[#006497] hover:text-[#003366] hover:underline underline-offset-4 whitespace-nowrap shrink-0 clinical-focus rounded px-2 py-2"
            >
              Portal Pacientes
            </a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1000px] w-full mx-auto px-5 md:px-8 py-10 flex items-center justify-center">
        <div className="clinical-card w-full rounded-2xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Left 5 Cols: Operator Identification */}
          <div className="md:col-span-5 space-y-4">
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#003366]">
              <ClinicalImage
                src={CLINICAL_ASSETS.tensAvatar}
                alt="Identificación de Técnico TENS LabExpress"
                className="w-full h-full object-cover"
                fallbackTitle="TENS"
              />
            </div>
            <p className="text-sm font-semibold text-[#006497]">
              Acceso Clínico Restringido
            </p>
            <h1 className="font-display text-2xl md:text-[28px] leading-tight font-bold text-[#001e40]">
              Portal Operativo Técnico TENS en Terreno
            </h1>
            <p className="text-base text-[#43474f]">
              La ruta domiciliaria, los datos de pacientes y el registro de cadena de frío están
              protegidos mediante autenticación exclusiva de personal TENS acreditado.
            </p>
          </div>

          {/* Right 7 Cols: Login or First-Run Setup Form */}
          <div className="md:col-span-7">
            {isLoadingStatus ? (
              <div className="py-12 text-center text-base text-[#43474f]">
                Verificando estado de acceso TENS...
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isFirstRunSetup && (
                  <div className="rounded-xl bg-[#ebf5fb] border border-[#2980b9] p-4 space-y-1">
                    <p className="text-sm font-bold text-[#1b4f72] flex items-center gap-2">
                      <KeyRound className="w-4 h-4 shrink-0" aria-hidden="true" />
                      <span>Configuración Inicial de Acceso TENS</span>
                    </p>
                    <p className="text-sm text-[#142132]">
                      Define por única vez la clave operativa para proteger el Portal TENS en este
                      entorno.
                    </p>
                  </div>
                )}

                {isFirstRunSetup && (
                  <div>
                    <label
                      htmlFor="tens-name"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      Nombre del Técnico TENS
                    </label>
                    <input
                      id="tens-name"
                      type="text"
                      required
                      value={operatorName}
                      onChange={(e) => setOperatorName(e.target.value)}
                      className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label
                    htmlFor="tens-sis"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    Registro Nacional SIS
                  </label>
                  <input
                    id="tens-sis"
                    type="text"
                    required
                    value={sisCode}
                    onChange={(e) => setSisCode(e.target.value)}
                    placeholder="SIS-48210"
                    className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white font-mono text-base tabular-nums text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tens-passcode"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    {isFirstRunSetup ? 'Nueva Clave Operativa TENS' : 'Clave Operativa TENS'}
                  </label>
                  <input
                    id="tens-passcode"
                    type="password"
                    required
                    minLength={isFirstRunSetup ? 8 : 1}
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder={
                      isFirstRunSetup ? 'Mínimo 8 caracteres' : 'Ingresa tu clave operativa'
                    }
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
                  {isFirstRunSetup ? (
                    <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                  ) : (
                    <Lock className="w-5 h-5 shrink-0" aria-hidden="true" />
                  )}
                  <span>
                    {isSubmitting
                      ? 'Validando acceso...'
                      : isFirstRunSetup
                      ? 'Guardar Clave e Ingresar al Portal TENS'
                      : 'Ingresar al Portal TENS'}
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
