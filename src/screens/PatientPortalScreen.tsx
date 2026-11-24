import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Calendar,
  Check,
  Clock,
  CreditCard,
  MapPin,
  Search,
  ShieldCheck,
  Snowflake,
  Stethoscope,
} from 'lucide-react';
import {
  CLINICAL_ASSETS,
  CLINICAL_EXAMS,
  SANTIAGO_COMUNAS,
  TIME_SLOT_OPTIONS,
  VISIT_DATE_OPTIONS,
  formatClp,
} from '../data/clinicalData';
import { ExamCategory, PatientBooking } from '../types';
import { ClinicalImage } from '../components/ClinicalImage';
import { FastingIndicator, RoutineInstructionIndicator } from '../components/ClinicalBadges';

interface PatientPortalScreenProps {
  booking: PatientBooking;
  onUpdateBooking: (updated: Partial<PatientBooking>) => void;
  onNavigateTens: () => void;
  onCompleteWebpay: (completedBooking: PatientBooking) => void;
  onLogout?: () => void;
}

const CATEGORIES: ExamCategory[] = ['Todos', 'Ayuno Requerido', 'Sin Ayuno', 'Chequeo General'];

export const PatientPortalScreen: React.FC<PatientPortalScreenProps> = ({
  booking,
  onUpdateBooking,
  onNavigateTens,
  onCompleteWebpay,
  onLogout,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const filteredExams = useMemo(() => {
    return CLINICAL_EXAMS.filter((exam) => {
      const matchesCategory =
        selectedCategory === 'Todos' || exam.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        exam.name.toLowerCase().includes(q) ||
        exam.description.toLowerCase().includes(q) ||
        exam.code.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [selectedCategory, searchQuery]);

  const selectedExams = useMemo(
    () => CLINICAL_EXAMS.filter((exam) => booking.selectedExamIds.includes(exam.id)),
    [booking.selectedExamIds]
  );

  const examsSubtotal = useMemo(
    () => selectedExams.reduce((sum, item) => sum + item.priceClp, 0),
    [selectedExams]
  );

  const totalAmount = examsSubtotal + (selectedExams.length > 0 ? booking.homeVisitFeeClp : 0);
  const requiresFasting = selectedExams.some((exam) => exam.fastingRequired);

  const toggleExam = (examId: string) => {
    setFormError(null);
    const exists = booking.selectedExamIds.includes(examId);
    const nextIds = exists
      ? booking.selectedExamIds.filter((id) => id !== examId)
      : [...booking.selectedExamIds, examId];
    onUpdateBooking({ selectedExamIds: nextIds });
  };

  const handleWebpaySubmit = () => {
    if (booking.selectedExamIds.length === 0) {
      setFormError('Selecciona al menos un examen clínico para agendar tu visita a domicilio.');
      return;
    }
    if (!booking.patientName.trim() || !booking.rut.trim() || !booking.address.trim()) {
      setFormError('Completa tu nombre completo, RUT y dirección exacta en Santiago.');
      return;
    }
    setFormError(null);
    const generatedOrder = `LX-${Math.floor(904800 + Math.random() * 190)}`;
    const generatedAuth = String(Math.floor(100000 + Math.random() * 899999));
    onCompleteWebpay({
      ...booking,
      orderNumber: generatedOrder,
      webpayAuthCode: generatedAuth,
      paidAtIso: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#142132]">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          <a
            href="#inicio"
            className="font-display text-xl font-bold tracking-tight text-[#003366] whitespace-nowrap shrink-0 clinical-focus rounded"
          >
            LabExpress
          </a>

          <nav
            aria-label="Navegación principal"
            className="flex items-center gap-4 md:gap-7 text-[15px] md:text-base font-semibold text-[#43474f]"
          >
            <a
              href="#catalogo-examenes"
              className="hidden md:inline-block hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Exámenes
            </a>
            <a
              href="#como-funciona"
              className="hidden md:inline-block hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Cómo Funciona
            </a>
            <a
              href="#cobertura"
              className="hidden lg:inline-block hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Cobertura
            </a>
            <a
              href="#portal-tens"
              data-path="portal-tens"
              onClick={(e) => {
                e.preventDefault();
                onNavigateTens();
              }}
              className="text-[#006497] hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded px-1 py-2"
            >
              Portal TENS
            </a>
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="text-[#43474f] hover:text-[#9e2b25] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer clinical-focus rounded px-1 py-2"
              >
                Cerrar sesión
              </button>
            )}
          </nav>

          <div className="shrink-0">
            <a
              href="#agendar-visita"
              className="inline-flex items-center justify-center min-h-[44px] md:min-h-[46px] px-4 md:px-5 rounded-lg bg-[#003366] text-white font-semibold text-sm md:text-base hover:bg-[#001e40] transition-colors whitespace-nowrap shrink-0 clinical-focus"
            >
              Agendar Visita
            </a>
          </div>
        </div>
      </header>

      <main id="inicio" className="max-w-[1200px] mx-auto px-5 md:px-8 py-8 md:py-12 space-y-12">
        {/* Hero Split */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
            <p className="text-base font-semibold text-[#006497]">
              Laboratorio Clínico a Domicilio · Santiago de Chile
            </p>
            <h1 className="font-display text-[30px] leading-[38px] md:text-[40px] md:leading-[48px] font-bold tracking-[-0.02em] text-[#001e40] text-balance">
              Exámenes clínicos seguros en la comodidad de tu hogar
            </h1>
            <p className="text-[18px] leading-[28px] text-[#43474f] max-w-[60ch]">
              Técnicos en Enfermería (TENS) acreditados visitan tu domicilio desde las 07:00 hrs
              con cadena de frío certificada y resultados digitales en 24 horas.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#agendar-visita"
                className="inline-flex items-center justify-center min-h-[54px] px-6 rounded-[10px] bg-[#003366] text-white text-[18px] font-bold hover:bg-[#001e40] transition-colors whitespace-nowrap shrink-0 clinical-focus"
              >
                Seleccionar exámenes
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center min-h-[54px] px-6 rounded-[10px] border-2 border-[#003366] text-[#003366] text-[18px] font-bold hover:bg-[#2980b9]/10 transition-colors whitespace-nowrap shrink-0 clinical-focus"
              >
                Ver preparación de ayuno
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[280px] md:min-h-[380px] rounded-2xl overflow-hidden border border-[#e2e8f0] bg-white">
              <ClinicalImage
                src={CLINICAL_ASSETS.heroHomeVisit}
                alt="Técnico TENS de LabExpress preparando bandeja estéril y contenedor isotérmico de muestras en domicilio"
                className="w-full h-full object-cover"
                fallbackTitle="Atención TENS Certificada a Domicilio"
              />
            </div>
          </div>
        </section>

        {/* Full-Width 4-Column Trust & Clinical Standards Strip */}
        <section
          id="cobertura"
          aria-label="Garantías clínicas del servicio"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div className="clinical-card rounded-2xl p-5 flex items-start gap-3.5">
            <Clock className="w-6 h-6 text-[#003366] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display font-bold text-lg text-[#001e40] tabular-nums">
                07:00 – 11:30 hrs
              </p>
              <p className="text-base text-[#43474f]">Ventanas matinales ideales para ayuno</p>
            </div>
          </div>

          <div className="clinical-card rounded-2xl p-5 flex items-start gap-3.5">
            <Snowflake className="w-6 h-6 text-[#196f3d] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display font-bold text-lg text-[#001e40] tabular-nums">
                2 °C – 8 °C
              </p>
              <p className="text-base text-[#43474f]">Cadena de frío monitoreada al laboratorio</p>
            </div>
          </div>

          <div className="clinical-card rounded-2xl p-5 flex items-start gap-3.5">
            <ShieldCheck className="w-6 h-6 text-[#006497] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display font-bold text-lg text-[#001e40]">TENS Acreditados</p>
              <p className="text-base text-[#43474f]">Registro Nacional de Prestadores SIS</p>
            </div>
          </div>

          <div className="clinical-card rounded-2xl p-5 flex items-start gap-3.5">
            <CreditCard className="w-6 h-6 text-[#003366] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-display font-bold text-lg text-[#001e40]">Fonasa e Isapres</p>
              <p className="text-base text-[#43474f]">Boleta electrónica inmediata para reembolso</p>
            </div>
          </div>
        </section>

        {/* Interactive Exam Catalog + Booking Form */}
        <section id="agendar-visita" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Columns: Exam Catalog */}
          <div id="catalogo-examenes" className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="font-display text-[26px] md:text-[32px] leading-[34px] md:leading-[40px] font-bold text-[#001e40]">
                1. Selecciona tus exámenes clínicos
              </h2>
              <p className="text-[18px] text-[#43474f]">
                Cada examen muestra de inmediato si requiere ayuno previo y el valor en pesos chilenos.
              </p>
            </div>

            {/* Search & Segmented Category Filter */}
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="buscar-examen"
                  className="block text-base font-semibold text-[#142132] mb-2"
                >
                  Buscar por nombre de examen o código
                </label>
                <div className="relative">
                  <Search
                    className="w-5 h-5 text-[#43474f] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    id="buscar-examen"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej: Perfil Lipídico, Glicemia, Tiroides..."
                    className="w-full h-[54px] pl-12 pr-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] placeholder:text-[#64748b] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div
                role="tablist"
                aria-label="Filtrar exámenes por preparación"
                className="flex flex-wrap items-center gap-2 bg-[#edeeef] p-1.5 rounded-xl"
              >
                {CATEGORIES.map((category) => {
                  const isActive = selectedCategory === category;
                  return (
                    <button
                      key={category}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setSelectedCategory(category)}
                      className={`min-h-[44px] px-4 rounded-lg text-[15px] font-semibold transition-colors whitespace-nowrap shrink-0 clinical-focus ${
                        isActive
                          ? 'bg-white text-[#003366] shadow-sm'
                          : 'text-[#43474f] hover:text-[#001e40]'
                      }`}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Exam Cards */}
            {filteredExams.length === 0 ? (
              <div className="clinical-card rounded-2xl p-8 text-center space-y-3">
                <p className="font-display font-semibold text-xl text-[#001e40]">
                  No encontramos exámenes con ese criterio
                </p>
                <p className="text-base text-[#43474f]">
                  Prueba limpiando el filtro o buscando otro nombre clínico.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('Todos');
                  }}
                  className="inline-flex items-center justify-center min-h-[48px] px-5 rounded-lg border-2 border-[#003366] text-[#003366] font-semibold clinical-focus"
                >
                  Mostrar todos los exámenes
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredExams.map((exam) => {
                  const isSelected = booking.selectedExamIds.includes(exam.id);
                  return (
                    <div
                      key={exam.id}
                      className={`clinical-card rounded-2xl p-5 md:p-6 transition-colors ${
                        isSelected
                          ? 'border-[#003366] bg-[#f5f8fc]'
                          : 'hover:border-[#94a3b8]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="text-sm font-mono text-[#43474f] tabular-nums">
                            {exam.code} · {exam.tubeType}
                          </div>
                          <h3 className="font-display text-xl font-semibold text-[#001e40]">
                            {exam.name}
                          </h3>
                        </div>

                        <div className="shrink-0">
                          {exam.fastingRequired ? (
                            <FastingIndicator label={exam.fastingHours || 'Ayuno requerido'} />
                          ) : (
                            <RoutineInstructionIndicator label="Sin ayuno requerido" />
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-base leading-[26px] text-[#43474f]">
                        {exam.description}
                      </p>

                      <div className="mt-4 pt-4 border-t border-[#e2e8f0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="block text-sm text-[#43474f]">
                            Valor particular · Resultados en {exam.turnaroundHours} hrs
                          </span>
                          <span className="font-display text-2xl font-bold text-[#001e40] tabular-nums">
                            {formatClp(exam.priceClp)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleExam(exam.id)}
                          aria-pressed={isSelected}
                          className={`inline-flex items-center justify-center gap-2.5 min-h-[52px] px-5 rounded-[10px] font-bold text-base transition-colors whitespace-nowrap shrink-0 clinical-focus ${
                            isSelected
                              ? 'bg-[#003366] text-white hover:bg-[#001e40]'
                              : 'border-2 border-[#003366] text-[#003366] bg-white hover:bg-[#2980b9]/10'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded flex items-center justify-center border-2 ${
                              isSelected
                                ? 'bg-white border-white text-[#003366]'
                                : 'border-[#003366] bg-white'
                            }`}
                            aria-hidden="true"
                          >
                            {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          </span>
                          <span>{isSelected ? 'Seleccionado' : 'Agregar examen'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 5 Columns: Booking Form & Webpay Summary */}
          <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
            <div className="clinical-card rounded-2xl p-6 md:p-7 space-y-6">
              <div className="space-y-1.5">
                <h2 className="font-display text-2xl font-bold text-[#001e40]">
                  2. Datos para toma a domicilio
                </h2>
                <p className="text-base text-[#43474f]">
                  Confirma quién recibe al técnico TENS y elige la ventana de llegada.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="patient-name"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    Nombre completo del paciente
                  </label>
                  <input
                    id="patient-name"
                    type="text"
                    value={booking.patientName}
                    onChange={(e) => onUpdateBooking({ patientName: e.target.value })}
                    className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="patient-rut"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      RUT del paciente
                    </label>
                    <input
                      id="patient-rut"
                      type="text"
                      value={booking.rut}
                      onChange={(e) => onUpdateBooking({ rut: e.target.value })}
                      className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base font-mono tabular-nums text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="patient-phone"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      Teléfono móvil
                    </label>
                    <input
                      id="patient-phone"
                      type="tel"
                      value={booking.phone}
                      onChange={(e) => onUpdateBooking({ phone: e.target.value })}
                      className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base tabular-nums text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="patient-comuna"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      Comuna (Santiago)
                    </label>
                    <select
                      id="patient-comuna"
                      value={booking.comuna}
                      onChange={(e) => onUpdateBooking({ comuna: e.target.value })}
                      className="w-full h-[54px] px-3.5 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    >
                      {SANTIAGO_COMUNAS.map((comuna) => (
                        <option key={comuna} value={comuna}>
                          {comuna}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="visit-date"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      Fecha de visita
                    </label>
                    <select
                      id="visit-date"
                      value={booking.visitDateLabel}
                      onChange={(e) => onUpdateBooking({ visitDateLabel: e.target.value })}
                      className="w-full h-[54px] px-3.5 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    >
                      {VISIT_DATE_OPTIONS.map((d) => (
                        <option key={d.id} value={d.label}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="patient-address"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    Dirección exacta (calle, número, depto)
                  </label>
                  <div className="relative">
                    <MapPin
                      className="w-5 h-5 text-[#43474f] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="patient-address"
                      type="text"
                      value={booking.address}
                      onChange={(e) => onUpdateBooking({ address: e.target.value })}
                      className="w-full h-[54px] pl-11 pr-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Card-based Radio Slot Selector */}
                <fieldset className="space-y-2.5 pt-1">
                  <legend className="text-base font-semibold text-[#142132] mb-1">
                    Ventana de llegada del técnico TENS
                  </legend>
                  <div className="space-y-2.5">
                    {TIME_SLOT_OPTIONS.map((slot) => {
                      const active = booking.timeSlotId === slot.id;
                      return (
                        <label
                          key={slot.id}
                          className={`flex items-center justify-between gap-3 min-h-[54px] px-4 py-3 rounded-[10px] border-[1.5px] cursor-pointer transition-colors ${
                            active
                              ? 'border-[#003366] bg-[#f0f6fa]'
                              : 'border-[#cbd5e1] bg-white hover:border-[#94a3b8]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="arrival-window"
                              checked={active}
                              onChange={() => onUpdateBooking({ timeSlotId: slot.id })}
                              className="w-6 h-6 accent-[#003366] cursor-pointer shrink-0"
                            />
                            <div>
                              <span className="block text-base font-bold text-[#001e40] tabular-nums">
                                {slot.range}
                              </span>
                              <span className="block text-sm text-[#43474f]">{slot.tag}</span>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </div>

              {/* Fasting Alert if required */}
              {requiresFasting && (
                <div className="rounded-xl bg-[#fdedeb] border-[1.5px] border-[#e0564c] p-4 flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#9e2b25] shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="text-[15px] leading-[22px] text-[#9e2b25]">
                    <p className="font-bold">Tu selección requiere ayuno de 8 a 12 horas</p>
                    <p>
                      Recomendamos la ventana de <strong>07:00 - 08:30 hrs</strong>. Al confirmar el
                      pago recibirás tu guía exacta de preparación.
                    </p>
                  </div>
                </div>
              )}

              {/* Financial Breakdown */}
              <div className="border-t border-[#e2e8f0] pt-5 space-y-2.5">
                <div className="flex items-center justify-between text-base text-[#43474f]">
                  <span>Exámenes seleccionados ({selectedExams.length})</span>
                  <span className="font-semibold text-[#142132] tabular-nums">
                    {formatClp(examsSubtotal)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-base text-[#43474f]">
                  <span>Toma de muestra a domicilio</span>
                  <span className="font-semibold text-[#142132] tabular-nums">
                    {selectedExams.length > 0 ? formatClp(booking.homeVisitFeeClp) : '$0'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#e2e8f0]">
                  <span className="font-display text-lg font-bold text-[#001e40]">Total a pagar</span>
                  <span className="font-display text-2xl font-bold text-[#003366] tabular-nums">
                    {formatClp(totalAmount)}
                  </span>
                </div>
              </div>

              {formError && (
                <div
                  role="alert"
                  className="rounded-xl bg-[#fdedeb] border border-[#e0564c] p-3.5 flex items-start gap-2.5 text-sm font-semibold text-[#9e2b25]"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{formError}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleWebpaySubmit}
                className="w-full min-h-[56px] px-6 rounded-[10px] bg-[#003366] text-white font-display font-bold text-[18px] hover:bg-[#001e40] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer clinical-focus"
              >
                <CreditCard className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>Pagar con Webpay Plus</span>
              </button>

              <p className="text-sm text-center text-[#43474f]">
                Transacción protegida por Transbank · Débito, Crédito o Prepago
              </p>
            </div>
          </aside>
        </section>

        {/* How it works & Cold Chain Proof */}
        <section
          id="como-funciona"
          className="clinical-card rounded-2xl p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-display text-[26px] md:text-[32px] font-bold text-[#001e40]">
              Preparación clara y protocolo clínico sin traslados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#006497]">
                  <Calendar className="w-4 h-4" aria-hidden="true" /> 01. Agenda y paga
                </span>
                <p className="text-base text-[#43474f]">
                  Elige tus exámenes, ventana matinal y paga seguro con Webpay Plus.
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#9e2b25]">
                  <Clock className="w-4 h-4" aria-hidden="true" /> 02. Cumple el ayuno
                </span>
                <p className="text-base text-[#43474f]">
                  Recibe la hora exacta de tu última comida y guía clara de hidratación.
                </p>
              </div>
              <div className="space-y-1.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#196f3d]">
                  <Stethoscope className="w-4 h-4" aria-hidden="true" /> 03. Toma en casa
                </span>
                <p className="text-base text-[#43474f]">
                  Nuestro TENS toma la muestra y la resguarda entre 2 °C y 8 °C.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-xl overflow-hidden border border-[#e2e8f0] aspect-[4/3]">
              <ClinicalImage
                src={CLINICAL_ASSETS.coldChainKit}
                alt="Contenedor isotérmico de cadena de frío a 3.8 °C junto a tubos estériles al vacío"
                className="w-full h-full object-cover"
                fallbackTitle="Cadena de Frío Certificada 2°C – 8°C"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
