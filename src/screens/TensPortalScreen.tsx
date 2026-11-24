import React, { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Barcode,
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Search,
  Snowflake,
  UserCheck,
} from 'lucide-react';
import { CLINICAL_ASSETS } from '../data/clinicalData';
import { PatientBooking, TensRouteStop, TensStopStatus } from '../types';
import { ClinicalImage } from '../components/ClinicalImage';
import { ColdChainIndicator, FastingIndicator, RoutineInstructionIndicator } from '../components/ClinicalBadges';

interface TensStopPatch {
  status?: TensStopStatus;
  identityVerified?: boolean;
  fastingVerified?: boolean;
  coolerVerified?: boolean;
  toggleTubeId?: string;
}

interface TensPortalScreenProps {
  stops: TensRouteStop[];
  activeBooking: PatientBooking;
  tensUserName?: string;
  tensSisCode?: string;
  onPatchStop: (stopId: string, patch: TensStopPatch) => void;
  onNavigatePatients: () => void;
  onLogoutTens: () => void;
}

type RouteFilter = 'Todos' | 'Pendientes' | 'Completados';

export const TensPortalScreen: React.FC<TensPortalScreenProps> = ({
  stops,
  tensUserName = 'Camila Rojas Mendoza',
  tensSisCode = 'SIS-48210',
  onPatchStop,
  onNavigatePatients,
  onLogoutTens,
}) => {
  const [selectedStopId, setSelectedStopId] = useState<string>(stops[1]?.id || stops[0]?.id || '');
  const [filter, setFilter] = useState<RouteFilter>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [incidentNote, setIncidentNote] = useState<string | null>(null);
  const [coolerSyncedAt, setCoolerSyncedAt] = useState('Hace 2 min');

  const filteredStops = useMemo(() => {
    return stops.filter((stop) => {
      const isDone = stop.status === 'Muestra Tomada' || stop.status === 'Cadena de Frío OK';
      const matchesFilter =
        filter === 'Todos' ||
        (filter === 'Pendientes' && !isDone) ||
        (filter === 'Completados' && isDone);
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        stop.patientName.toLowerCase().includes(q) ||
        stop.rut.toLowerCase().includes(q) ||
        stop.comuna.toLowerCase().includes(q) ||
        stop.orderNumber.toLowerCase().includes(q);
      return matchesFilter && matchesQuery;
    });
  }, [stops, filter, searchQuery]);

  const activeStop = useMemo(
    () => stops.find((s) => s.id === selectedStopId) || filteredStops[0] || stops[0],
    [stops, selectedStopId, filteredStops]
  );

  const completedCount = stops.filter(
    (s) => s.status === 'Muestra Tomada' || s.status === 'Cadena de Frío OK'
  ).length;
  const scannedTubesCount = stops.reduce(
    (acc, s) => acc + s.tubes.filter((t) => t.scanned).length,
    0
  );
  const totalTubesCount = stops.reduce((acc, s) => acc + s.tubes.length, 0);

  const handleToggleChecklist = (
    field: 'identityVerified' | 'fastingVerified' | 'coolerVerified'
  ) => {
    if (!activeStop) return;
    setIncidentNote(null);
    onPatchStop(activeStop.id, { [field]: !activeStop[field] });
  };

  const handleToggleTubeScan = (tubeId: string) => {
    if (!activeStop) return;
    setIncidentNote(null);
    onPatchStop(activeStop.id, { toggleTubeId: tubeId });
  };

  const handleSetStatus = (nextStatus: TensStopStatus) => {
    if (!activeStop) return;
    setIncidentNote(null);
    onPatchStop(activeStop.id, { status: nextStatus });
  };

  const handleSyncCooler = () => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    setCoolerSyncedAt(`${hh}:${mm} hrs`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#142132]">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          <span className="font-display text-xl font-bold tracking-tight text-[#003366] whitespace-nowrap shrink-0">
            LabExpress
          </span>

          <nav
            aria-label="Navegación operativa TENS"
            className="flex items-center gap-5 md:gap-7 text-[15px] md:text-base font-semibold text-[#43474f]"
          >
            <a
              href="#ruta-diaria"
              className="hidden md:inline-block hover:text-[#003366] hover:underline underline-offset-4 whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Ruta del Día
            </a>
            <a
              href="#estacion-toma"
              className="hidden md:inline-block hover:text-[#003366] hover:underline underline-offset-4 whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Toma y Cadena de Frío
            </a>
            <a
              href="#portal-pacientes"
              data-path="portal-pacientes"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePatients();
              }}
              className="text-[#006497] hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded px-1 py-2"
            >
              Portal Pacientes
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#cbd5e1] shrink-0">
              <ClinicalImage
                src={CLINICAL_ASSETS.tensAvatar}
                alt={`${tensUserName}, Técnico TENS`}
                className="w-full h-full object-cover"
                fallbackTitle="TENS"
              />
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <span className="block text-sm font-bold text-[#001e40] whitespace-nowrap">
                {tensUserName}
              </span>
              <span className="block text-xs font-mono text-[#43474f] whitespace-nowrap tabular-nums">
                {tensSisCode}
              </span>
            </div>
            <button
              type="button"
              onClick={onLogoutTens}
              className="min-h-[40px] px-3 rounded-lg border border-[#cbd5e1] text-sm font-semibold text-[#43474f] hover:text-[#9e2b25] hover:border-[#e0564c] transition-colors whitespace-nowrap shrink-0 cursor-pointer clinical-focus"
            >
              Salir TENS
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 md:px-8 py-7 space-y-7">
        {/* Operational Header & 4-KPI Telemetry Ribbon */}
        <section className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#006497]">
                Portal Operativo Técnico TENS en Terreno · Zona Oriente
              </p>
              <h1 className="font-display text-[26px] md:text-[32px] font-bold text-[#001e40]">
                Ruta Domiciliaria y Control de Muestras
              </h1>
            </div>
            <button
              type="button"
              onClick={handleSyncCooler}
              className="inline-flex items-center justify-center gap-2 min-h-[48px] px-5 rounded-[10px] border-2 border-[#003366] text-[#003366] font-semibold text-base hover:bg-[#2980b9]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer clinical-focus"
            >
              <Snowflake className="w-4 h-4" aria-hidden="true" />
              <span>Actualizar Sensor Cooler</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="clinical-card rounded-2xl p-5">
              <span className="block text-sm font-semibold text-[#43474f]">Visitas Completadas</span>
              <p className="mt-1 font-display text-3xl font-bold text-[#001e40] tabular-nums">
                {completedCount} / {stops.length}
              </p>
              <span className="block mt-1 text-sm text-[#43474f]">Turno Matinal Santiago</span>
            </div>

            <div className="clinical-card rounded-2xl p-5">
              <span className="block text-sm font-semibold text-[#43474f]">
                Temperatura Cooler Isotérmico
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-3xl font-bold text-[#196f3d] tabular-nums">
                  {activeStop ? activeStop.coolerTempC.toFixed(1) : '3.8'} °C
                </span>
              </div>
              <span className="block mt-1 text-sm font-semibold text-[#196f3d]">
                Nominal (2.0 – 8.0 °C) · {coolerSyncedAt}
              </span>
            </div>

            <div className="clinical-card rounded-2xl p-5">
              <span className="block text-sm font-semibold text-[#43474f]">
                Tubos Rotulados y Escaneados
              </span>
              <p className="mt-1 font-display text-3xl font-bold text-[#001e40] tabular-nums">
                {scannedTubesCount} / {totalTubesCount}
              </p>
              <span className="block mt-1 text-sm text-[#43474f]">Trazabilidad por código</span>
            </div>

            <div className="clinical-card rounded-2xl p-5">
              <span className="block text-sm font-semibold text-[#43474f]">
                Próxima Ventana Prioritaria
              </span>
              <p className="mt-1 font-mono text-2xl font-bold text-[#003366] tabular-nums">
                07:45 - 08:30
              </p>
              <span className="block mt-1 text-sm font-semibold text-[#9e2b25]">
                Paciente con ayuno estricto
              </span>
            </div>
          </div>
        </section>

        {/* Main 12-Col Operational Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
          {/* Left 5 Cols: Route Queue */}
          <div id="ruta-diaria" className="lg:col-span-5 space-y-4">
            <div className="clinical-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold text-[#001e40]">
                  Domicilios Asignados
                </h2>
                <span className="text-sm font-mono font-semibold text-[#43474f] tabular-nums">
                  {filteredStops.length} paradas
                </span>
              </div>

              <div className="relative">
                <Search
                  className="w-4 h-4 text-[#43474f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  aria-label="Buscar paciente en ruta"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, RUT o comuna..."
                  className="w-full h-[48px] pl-10 pr-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-1.5 bg-[#edeeef] p-1 rounded-xl">
                {(['Todos', 'Pendientes', 'Completados'] as RouteFilter[]).map((tab) => {
                  const active = filter === tab;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilter(tab)}
                      className={`min-h-[40px] px-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer clinical-focus ${
                        active ? 'bg-white text-[#003366] shadow-sm' : 'text-[#43474f]'
                      }`}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {filteredStops.length === 0 ? (
                  <div className="py-8 text-center space-y-2">
                    <p className="font-semibold text-[#001e40]">No hay domicilios en este filtro</p>
                    <button
                      type="button"
                      onClick={() => {
                        setFilter('Todos');
                        setSearchQuery('');
                      }}
                      className="text-sm font-semibold text-[#006497] underline cursor-pointer"
                    >
                      Ver todas las paradas
                    </button>
                  </div>
                ) : (
                  filteredStops.map((stop) => {
                    const isActive = activeStop?.id === stop.id;
                    const isCompleted =
                      stop.status === 'Muestra Tomada' || stop.status === 'Cadena de Frío OK';
                    return (
                      <button
                        key={stop.id}
                        type="button"
                        onClick={() => {
                          setSelectedStopId(stop.id);
                          setIncidentNote(null);
                        }}
                        className={`w-full text-left rounded-xl p-4 border-[1.5px] transition-colors cursor-pointer clinical-focus ${
                          isActive
                            ? 'border-[#003366] bg-[#f0f6fa]'
                            : 'border-[#e2e8f0] bg-white hover:border-[#94a3b8]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className="font-mono font-semibold text-[#003366] tabular-nums">
                            {stop.timeWindow}
                          </span>
                          <span
                            className={`font-semibold ${
                              isCompleted ? 'text-[#196f3d]' : 'text-[#006497]'
                            }`}
                          >
                            {stop.status}
                          </span>
                        </div>

                        <p className="mt-1 font-display text-lg font-bold text-[#001e40]">
                          {stop.patientName}
                        </p>

                        <div className="mt-1 text-sm text-[#43474f] flex flex-wrap items-center gap-x-2">
                          <span className="font-mono tabular-nums">{stop.rut}</span>
                          <span aria-hidden="true">·</span>
                          <span>{stop.comuna}</span>
                        </div>

                        <p className="mt-1 text-sm text-[#43474f] truncate">{stop.address}</p>

                        <div className="mt-2.5 flex items-center justify-between text-xs font-semibold">
                          <span
                            className={
                              stop.requiresFasting ? 'text-[#9e2b25]' : 'text-[#1b4f72]'
                            }
                          >
                            {stop.requiresFasting
                              ? `Ayuno ${stop.fastingHoursTarget}`
                              : 'Sin ayuno'}
                          </span>
                          <span className="font-mono text-[#43474f] tabular-nums">
                            {stop.tubes.filter((t) => t.scanned).length}/{stop.tubes.length} tubos
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right 7 Cols: Active Patient Collection Station */}
          {activeStop && (
            <div id="estacion-toma" className="lg:col-span-7 space-y-6">
              <div className="clinical-card rounded-2xl p-6 md:p-7 space-y-6">
                {/* Dossier Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-[#e2e8f0]">
                  <div className="space-y-1.5">
                    <div className="text-sm font-mono text-[#43474f] tabular-nums">
                      Orden #{activeStop.orderNumber} · Ventana {activeStop.timeWindow}
                    </div>
                    <h2 className="font-display text-2xl font-bold text-[#001e40]">
                      {activeStop.patientName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-[#43474f]">
                      <span className="font-mono tabular-nums">RUT {activeStop.rut}</span>
                      <span aria-hidden="true">·</span>
                      <span>{activeStop.age} años</span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {activeStop.status === 'Cadena de Frío OK' ? (
                      <ColdChainIndicator label="Cadena de Frío OK" />
                    ) : activeStop.requiresFasting ? (
                      <FastingIndicator label={`Ayuno ${activeStop.fastingHoursTarget}`} />
                    ) : (
                      <RoutineInstructionIndicator label="Sin ayuno" />
                    )}
                  </div>
                </div>

                {/* Address & Access Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
                  <div className="rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] p-4 space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003366]">
                      <MapPin className="w-4 h-4" aria-hidden="true" /> Dirección de visita
                    </span>
                    <p className="font-semibold text-[#142132]">{activeStop.address}</p>
                    <p className="text-sm text-[#43474f]">{activeStop.comuna}, Santiago</p>
                  </div>

                  <div className="rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] p-4 space-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#003366]">
                      <Phone className="w-4 h-4" aria-hidden="true" /> Contacto y acceso
                    </span>
                    <p className="font-mono font-semibold text-[#142132] tabular-nums">
                      {activeStop.phone}
                    </p>
                    <p className="text-sm text-[#43474f]">{activeStop.accessNotes}</p>
                  </div>
                </div>

                {/* Exams Requested */}
                <div className="space-y-2">
                  <h3 className="font-display text-lg font-bold text-[#001e40]">
                    Exámenes incluidos en la orden
                  </h3>
                  <ul className="space-y-1.5 text-base text-[#142132]">
                    {activeStop.exams.map((examName) => (
                      <li key={examName} className="flex items-center gap-2">
                        <CheckCircle2
                          className="w-4 h-4 text-[#006497] shrink-0"
                          aria-hidden="true"
                        />
                        <span>{examName}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Clinical Verification Checklist */}
                <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                  <h3 className="font-display text-lg font-bold text-[#001e40]">
                    Protocolo de verificación clínica en domicilio
                  </h3>

                  <button
                    type="button"
                    onClick={() => handleToggleChecklist('identityVerified')}
                    aria-pressed={activeStop.identityVerified}
                    className={`w-full min-h-[54px] px-4 py-3 rounded-xl border-[1.5px] flex items-center justify-between gap-3 text-left cursor-pointer transition-colors clinical-focus ${
                      activeStop.identityVerified
                        ? 'border-[#27ae60] bg-[#eaf8f0]'
                        : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <UserCheck
                        className={`w-5 h-5 shrink-0 ${
                          activeStop.identityVerified ? 'text-[#196f3d]' : 'text-[#43474f]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-base font-semibold text-[#142132]">
                        1. Cédula de identidad y RUT verificados presencialmente
                      </span>
                    </div>
                    <span className="text-sm font-bold text-[#196f3d] whitespace-nowrap">
                      {activeStop.identityVerified ? 'Verificado' : 'Confirmar'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleChecklist('fastingVerified')}
                    aria-pressed={activeStop.fastingVerified}
                    className={`w-full min-h-[54px] px-4 py-3 rounded-xl border-[1.5px] flex items-center justify-between gap-3 text-left cursor-pointer transition-colors clinical-focus ${
                      activeStop.fastingVerified
                        ? 'border-[#27ae60] bg-[#eaf8f0]'
                        : 'border-[#e0564c] bg-[#fdedeb]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Clock
                        className={`w-5 h-5 shrink-0 ${
                          activeStop.fastingVerified ? 'text-[#196f3d]' : 'text-[#9e2b25]'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="text-base font-semibold text-[#142132]">
                        2. Confirmación de ayuno ({activeStop.fastingHoursTarget})
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold whitespace-nowrap ${
                        activeStop.fastingVerified ? 'text-[#196f3d]' : 'text-[#9e2b25]'
                      }`}
                    >
                      {activeStop.fastingVerified ? 'Cumplido' : 'Pendiente'}
                    </span>
                  </button>
                </div>

                {/* Tube Scanning Section */}
                <div className="space-y-3 pt-2 border-t border-[#e2e8f0]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold text-[#001e40]">
                      3. Rotulación y escaneo de tubos al vacío
                    </h3>
                    <span className="text-sm font-mono text-[#43474f] tabular-nums">
                      {activeStop.tubes.filter((t) => t.scanned).length}/{activeStop.tubes.length}{' '}
                      escaneados
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    {activeStop.tubes.map((tube) => (
                      <button
                        key={tube.id}
                        type="button"
                        onClick={() => handleToggleTubeScan(tube.id)}
                        className={`w-full min-h-[54px] px-4 py-3 rounded-xl border-[1.5px] flex items-center justify-between gap-3 cursor-pointer transition-colors clinical-focus ${
                          tube.scanned
                            ? 'border-[#27ae60] bg-[#eaf8f0]'
                            : 'border-[#cbd5e1] bg-white hover:border-[#003366]'
                        }`}
                      >
                        <div className="flex items-center gap-3 text-left">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shrink-0"
                            style={{ backgroundColor: tube.capColor }}
                            aria-hidden="true"
                          />
                          <div>
                            <span className="block text-base font-semibold text-[#142132]">
                              {tube.label}
                            </span>
                            <span className="block text-sm font-mono text-[#43474f] tabular-nums">
                              Código: {tube.barcode}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 text-sm font-bold whitespace-nowrap ${
                            tube.scanned ? 'text-[#196f3d]' : 'text-[#003366]'
                          }`}
                        >
                          <Barcode className="w-4 h-4" aria-hidden="true" />
                          <span>{tube.scanned ? 'Escaneado' : 'Marcar Toma'}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cold Chain Cooler Deposit */}
                <div className="rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#cbd5e1] shrink-0">
                      <ClinicalImage
                        src={CLINICAL_ASSETS.coldChainKit}
                        alt="Cooler isotérmico de muestras clínicas"
                        className="w-full h-full object-cover"
                        fallbackTitle="3.8 °C"
                      />
                    </div>
                    <div>
                      <p className="font-display font-bold text-base text-[#001e40]">
                        4. Resguardo en Cooler ({activeStop.coolerTempC.toFixed(1)} °C)
                      </p>
                      <p className="text-sm text-[#43474f]">
                        Gradilla vertical con gel refrigerante certificado.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleChecklist('coolerVerified')}
                    className={`min-h-[48px] px-4 rounded-lg font-semibold text-sm whitespace-nowrap shrink-0 cursor-pointer transition-colors clinical-focus ${
                      activeStop.coolerVerified
                        ? 'bg-[#196f3d] text-white'
                        : 'border-2 border-[#003366] text-[#003366] bg-white'
                    }`}
                  >
                    {activeStop.coolerVerified ? 'Guardado en Cooler' : 'Confirmar Cooler'}
                  </button>
                </div>

                {incidentNote && (
                  <div
                    role="status"
                    className="rounded-xl bg-[#fdedeb] border border-[#e0564c] p-4 text-sm font-semibold text-[#9e2b25]"
                  >
                    {incidentNote}
                  </div>
                )}

                {/* Action Footer Buttons */}
                <div className="pt-3 border-t border-[#e2e8f0] flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSetStatus('En Domicilio')}
                      className="min-h-[52px] px-5 rounded-[10px] border-2 border-[#003366] text-[#003366] font-bold text-base hover:bg-[#2980b9]/10 transition-colors whitespace-nowrap cursor-pointer clinical-focus"
                    >
                      Registrar Llegada
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetStatus('Cadena de Frío OK')}
                      className="min-h-[52px] px-5 rounded-[10px] bg-[#003366] text-white font-bold text-base hover:bg-[#001e40] transition-colors whitespace-nowrap cursor-pointer clinical-focus"
                    >
                      Confirmar Toma y Cadena de Frío
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setIncidentNote(
                        `Incidencia registrada para orden #${activeStop.orderNumber}: coordinación telefónica con central médica activada.`
                      )
                    }
                    className="inline-flex items-center gap-1.5 min-h-[48px] px-4 rounded-lg text-sm font-semibold text-[#9e2b25] hover:bg-[#fdedeb] transition-colors whitespace-nowrap cursor-pointer clinical-focus"
                  >
                    <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                    <span>Reportar Incidencia</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
