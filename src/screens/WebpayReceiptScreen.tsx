import React, { useMemo } from 'react';
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Download,
  MapPin,
  ShieldCheck,
  Smartphone,
  Snowflake,
  XCircle,
} from 'lucide-react';
import {
  CLINICAL_ASSETS,
  CLINICAL_EXAMS,
  TIME_SLOT_OPTIONS,
  formatClp,
} from '../data/clinicalData';
import { PatientBooking } from '../types';
import { ClinicalImage } from '../components/ClinicalImage';
import { ColdChainIndicator, FastingIndicator, RoutineInstructionIndicator } from '../components/ClinicalBadges';

interface WebpayReceiptScreenProps {
  booking: PatientBooking;
  onNavigatePatients: () => void;
  onNavigateTens: () => void;
  onNavigateMobilePass: () => void;
}

export const WebpayReceiptScreen: React.FC<WebpayReceiptScreenProps> = ({
  booking,
  onNavigatePatients,
  onNavigateTens,
  onNavigateMobilePass,
}) => {
  const selectedExams = useMemo(
    () => CLINICAL_EXAMS.filter((e) => booking.selectedExamIds.includes(e.id)),
    [booking.selectedExamIds]
  );

  const examsSubtotal = useMemo(
    () => selectedExams.reduce((sum, e) => sum + e.priceClp, 0),
    [selectedExams]
  );

  const totalPaid = examsSubtotal + (selectedExams.length > 0 ? booking.homeVisitFeeClp : 0);
  const requiresFasting = selectedExams.some((e) => e.fastingRequired);

  const activeSlot =
    TIME_SLOT_OPTIONS.find((s) => s.id === booking.timeSlotId) || TIME_SLOT_OPTIONS[0];

  const recommendedFastingStart =
    booking.timeSlotId === 'slot-0700'
      ? '21:00 hrs'
      : booking.timeSlotId === 'slot-0830'
      ? '22:30 hrs'
      : '23:45 hrs';

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#142132]">
      {/* Top Bar Contract: 3 zones */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#e2e8f0]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
          <span className="font-display text-xl font-bold tracking-tight text-[#003366] whitespace-nowrap shrink-0">
            LabExpress
          </span>

          <nav
            aria-label="Navegación comprobante"
            className="flex items-center gap-4 md:gap-7 text-[15px] md:text-base font-semibold text-[#43474f]"
          >
            <a
              href="#portal-pacientes"
              data-path="portal-pacientes"
              onClick={(e) => {
                e.preventDefault();
                onNavigatePatients();
              }}
              className="hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded px-1 py-2"
            >
              Portal Pacientes
            </a>
            <a
              href="#preparacion-ayuno"
              className="hidden md:inline-block hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Ayuno Clínico
            </a>
            <a
              href="#detalle-webpay"
              className="hidden md:inline-block hover:text-[#003366] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 clinical-focus rounded"
            >
              Detalle Webpay
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
          </nav>

          <div className="shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-lg border-2 border-[#003366] text-[#003366] font-semibold text-sm md:text-base hover:bg-[#2980b9]/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer clinical-focus"
            >
              <Download className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Imprimir Boleta</span>
              <span className="sm:hidden">Boleta</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-5 md:px-8 py-8 md:py-10 space-y-8">
        {/* Webpay Confirmation Hero Banner */}
        <section className="clinical-card rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#eaf8f0] border border-[#27ae60] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-7 h-7 text-[#196f3d]" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-[#196f3d]">
                Transacción Webpay Plus Aprobada · Boleta Electrónica Emitida
              </p>
              <h1 className="font-display text-[26px] md:text-[32px] leading-[34px] md:leading-[40px] font-bold text-[#001e40]">
                Tu toma de muestra a domicilio está confirmada
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base text-[#43474f] pt-1">
                <span>
                  Orden{' '}
                  <strong className="font-mono text-[#001e40] tabular-nums">
                    #{booking.orderNumber}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Código Webpay{' '}
                  <strong className="font-mono text-[#001e40] tabular-nums">
                    {booking.webpayAuthCode}
                  </strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Tarjeta Redcompra{' '}
                  <strong className="font-mono tabular-nums">•••• {booking.cardLastFour}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex flex-col items-start md:items-end">
            <span className="text-sm text-[#43474f]">Total pagado</span>
            <span className="font-display text-3xl font-bold text-[#003366] tabular-nums">
              {formatClp(totalPaid)}
            </span>
          </div>
        </section>

        {/* 12-Col Split: Fasting Preparation & Webpay Details */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Fasting Protocol & Exam Prep */}
          <div id="preparacion-ayuno" className="lg:col-span-7 space-y-6">
            {requiresFasting ? (
              <div className="rounded-2xl bg-[#fdedeb] border-[1.5px] border-[#e0564c] p-6 md:p-7 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 text-[#9e2b25]">
                    <Clock className="w-6 h-6 shrink-0" aria-hidden="true" />
                    <h2 className="font-display text-2xl font-bold">
                      Indicaciones Obligatorias de Ayuno Clínico
                    </h2>
                  </div>
                  <FastingIndicator label="Ayuno 8 a 12 hrs" />
                </div>

                <div className="rounded-xl bg-white border border-[#e0564c]/40 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="block text-sm font-semibold text-[#43474f]">
                      Hora recomendada de última comida hoy
                    </span>
                    <span className="font-display text-3xl font-bold text-[#9e2b25] tabular-nums">
                      {recommendedFastingStart}
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="block text-sm font-semibold text-[#43474f]">
                      Ventana asignada del técnico TENS
                    </span>
                    <span className="font-display text-xl font-bold text-[#001e40] tabular-nums">
                      {activeSlot.range}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[17px] leading-[26px]">
                  <div className="rounded-xl bg-white/85 border border-[#27ae60]/40 p-4 space-y-2">
                    <p className="font-bold text-[#196f3d] flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>Sí puedes consumir</span>
                    </p>
                    <ul className="space-y-1.5 text-base text-[#142132]">
                      <li>• Agua pura sin gas (1 a 2 vasos).</li>
                      <li>• Medicación crónica habitual, salvo indicación médica distinta.</li>
                    </ul>
                  </div>

                  <div className="rounded-xl bg-white/85 border border-[#e0564c]/40 p-4 space-y-2">
                    <p className="font-bold text-[#9e2b25] flex items-center gap-2">
                      <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span>Evitar durante el ayuno</span>
                    </p>
                    <ul className="space-y-1.5 text-base text-[#142132]">
                      <li>• Café, té, mate, jugos, lácteos o bebidas.</li>
                      <li>• Chicles, caramelos, cigarrillos o alcohol.</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-[#ebf5fb] border-[1.5px] border-[#2980b9] p-6 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-bold text-[#001e40]">
                    Preparación para tu visita
                  </h2>
                  <RoutineInstructionIndicator label="Sin ayuno requerido" />
                </div>
                <p className="text-[18px] text-[#142132]">
                  Ninguno de los exámenes seleccionados requiere ayuno estricto. Mantén tu
                  hidratación habitual con agua antes de la llegada del técnico TENS.
                </p>
              </div>
            )}

            {/* Per-Exam Breakdown */}
            <div className="clinical-card rounded-2xl p-6 md:p-7 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-[#001e40]">
                  Exámenes y tubos asignados
                </h2>
                <ColdChainIndicator />
              </div>

              <div className="divide-y divide-[#e2e8f0]">
                {selectedExams.map((exam) => (
                  <div
                    key={exam.id}
                    className="py-4 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-[#43474f]">
                        <span className="font-mono tabular-nums">{exam.code}</span>
                        <span aria-hidden="true">·</span>
                        <span>{exam.tubeType}</span>
                      </div>
                      <p className="font-display text-lg font-semibold text-[#001e40]">
                        {exam.name}
                      </p>
                      <p className="text-base text-[#43474f]">{exam.specialInstruction}</p>
                    </div>
                    <div className="sm:text-right shrink-0">
                      <span className="block font-display text-lg font-bold text-[#001e40] tabular-nums">
                        {formatClp(exam.priceClp)}
                      </span>
                      <span
                        className={`text-sm font-semibold ${
                          exam.fastingRequired ? 'text-[#9e2b25]' : 'text-[#1b4f72]'
                        }`}
                      >
                        {exam.fastingRequired ? exam.fastingHours : 'Sin ayuno'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned TENS Professional */}
            <div className="clinical-card rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#cbd5e1] shrink-0">
                  <ClinicalImage
                    src={CLINICAL_ASSETS.tensAvatar}
                    alt={`${booking.assignedTensName}, TENS certificada`}
                    className="w-full h-full object-cover"
                    fallbackTitle="TENS"
                  />
                </div>
                <div>
                  <span className="text-sm font-semibold text-[#006497]">
                    Técnico TENS asignado a tu visita
                  </span>
                  <h3 className="font-display text-xl font-bold text-[#001e40]">
                    {booking.assignedTensName}
                  </h3>
                  <p className="text-sm font-mono text-[#43474f] tabular-nums">
                    Registro Nacional {booking.assignedTensSis} · Identificación verificable
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#196f3d] shrink-0">
                <Snowflake className="w-4 h-4" aria-hidden="true" />
                <span>Cooler 2°C – 8°C</span>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Webpay Receipt & Navigation Actions */}
          <aside id="detalle-webpay" className="lg:col-span-5 space-y-6">
            <div className="clinical-card rounded-2xl p-6 md:p-7 space-y-6">
              <h2 className="font-display text-2xl font-bold text-[#001e40]">
                Comprobante de Pago y Visita
              </h2>

              <dl className="space-y-3.5 text-base">
                <div className="flex justify-between gap-3">
                  <dt className="text-[#43474f]">Paciente</dt>
                  <dd className="font-semibold text-[#142132] text-right">
                    {booking.patientName}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#43474f]">RUT</dt>
                  <dd className="font-mono font-semibold text-[#142132] tabular-nums">
                    {booking.rut}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#43474f]">Fecha de visita</dt>
                  <dd className="font-semibold text-[#142132] text-right">
                    {booking.visitDateLabel}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-[#43474f]">Ventana horaria</dt>
                  <dd className="font-mono font-bold text-[#003366] tabular-nums text-right">
                    {activeSlot.range}
                  </dd>
                </div>
                <div className="pt-3 border-t border-[#e2e8f0] space-y-1">
                  <dt className="text-sm font-semibold text-[#43474f] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" aria-hidden="true" /> Domicilio de toma
                  </dt>
                  <dd className="font-semibold text-[#142132]">
                    {booking.address}, {booking.comuna}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-[#e2e8f0] pt-4 space-y-2.5 text-base">
                <div className="flex justify-between text-[#43474f]">
                  <span>Subtotal exámenes ({selectedExams.length})</span>
                  <span className="font-semibold text-[#142132] tabular-nums">
                    {formatClp(examsSubtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-[#43474f]">
                  <span>Despacho y toma TENS</span>
                  <span className="font-semibold text-[#142132] tabular-nums">
                    {selectedExams.length > 0 ? formatClp(booking.homeVisitFeeClp) : '$0'}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-[#e2e8f0]">
                  <span className="font-display font-bold text-lg text-[#001e40]">
                    Total Webpay Plus
                  </span>
                  <span className="font-display font-bold text-2xl text-[#003366] tabular-nums">
                    {formatClp(totalPaid)}
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#f8f9fa] border border-[#e2e8f0] p-4 flex items-center gap-3 text-sm text-[#43474f]">
                <CreditCard className="w-5 h-5 text-[#003366] shrink-0" aria-hidden="true" />
                <span>
                  Boleta electrónica válida para reembolso automático en Fonasa e Isapres.
                </span>
              </div>

              {/* Required Prototype Navigation Links */}
              <div className="space-y-3 pt-2">
                <a
                  href="#comprobante-movil"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateMobilePass();
                  }}
                  className="w-full min-h-[54px] px-5 rounded-[10px] bg-[#003366] text-white font-display font-bold text-[17px] hover:bg-[#001e40] transition-colors flex items-center justify-center gap-2.5 text-center clinical-focus"
                >
                  <Smartphone className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>Gestionar o Modificar mi Cita</span>
                </a>

                <a
                  href="#inicio"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigatePatients();
                  }}
                  className="w-full min-h-[54px] px-5 rounded-[10px] border-2 border-[#003366] text-[#003366] font-display font-bold text-[17px] hover:bg-[#2980b9]/10 transition-colors flex items-center justify-center text-center clinical-focus"
                >
                  Volver al Inicio
                </a>
              </div>
            </div>

            <div className="clinical-card rounded-2xl p-5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#196f3d] shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-sm text-[#43474f]">
                ¿Necesitas cambiar el horario o avisar a un cuidador? Abre tu pase móvil para
                actualizar instrucciones de acceso y calcular tu hora de ayuno.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
};
