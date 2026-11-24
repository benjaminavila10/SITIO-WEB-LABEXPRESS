import React, { useMemo, useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock,
  Download,
  MapPin,
  Share2,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import {
  CLINICAL_EXAMS,
  TIME_SLOT_OPTIONS,
  VISIT_DATE_OPTIONS,
  formatClp,
} from '../data/clinicalData';
import { PatientBooking } from '../types';
import { FastingIndicator, RoutineInstructionIndicator } from '../components/ClinicalBadges';
import { generateAppointmentReceiptPdfBlob } from '../utils/receiptPdf';

interface MobileReceiptScreenProps {
  booking: PatientBooking;
  onUpdateBooking: (updated: Partial<PatientBooking>) => void;
  onBackToReceipt: () => void;
  onBackToHome: () => void;
}

function parseHourMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 21 * 60;
  return h * 60 + m;
}

export const MobileReceiptScreen: React.FC<MobileReceiptScreenProps> = ({
  booking,
  onUpdateBooking,
  onBackToReceipt,
  onBackToHome,
}) => {
  const [draftDate, setDraftDate] = useState(booking.visitDateLabel);
  const [draftSlotId, setDraftSlotId] = useState(booking.timeSlotId);
  const [draftAccessNotes, setDraftAccessNotes] = useState(booking.accessNotes);
  const [draftFastingStart, setDraftFastingStart] = useState(booking.fastingStartTime);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const selectedExams = useMemo(
    () => CLINICAL_EXAMS.filter((e) => booking.selectedExamIds.includes(e.id)),
    [booking.selectedExamIds]
  );

  const requiresFasting = selectedExams.some((e) => e.fastingRequired);
  const totalPaid =
    selectedExams.reduce((sum, e) => sum + e.priceClp, 0) +
    (selectedExams.length > 0 ? booking.homeVisitFeeClp : 0);

  const currentSlot =
    TIME_SLOT_OPTIONS.find((s) => s.id === draftSlotId) || TIME_SLOT_OPTIONS[0];

  const calculatedFastingHours = useMemo(() => {
    const startMins = parseHourMinutes(draftFastingStart);
    const arrivalHour = draftSlotId === 'slot-0700' ? 7.5 : draftSlotId === 'slot-0830' ? 9 : 10.5;
    const arrivalMins = arrivalHour * 60 + 24 * 60;
    const diffHours = ((arrivalMins - startMins) / 60).toFixed(1);
    return diffHours;
  }, [draftFastingStart, draftSlotId]);

  const handleSaveChanges = () => {
    onUpdateBooking({
      visitDateLabel: draftDate,
      timeSlotId: draftSlotId,
      accessNotes: draftAccessNotes,
      fastingStartTime: draftFastingStart,
    });
    setSaveMessage('Cambios guardados en tu cita y sincronizados con el equipo TENS.');
  };

  const handleSharePass = async () => {
    const summary = `LabExpress Pase #${booking.orderNumber} - ${booking.patientName} - ${draftDate} (${currentSlot.range}) - ${booking.address}, ${booking.comuna}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(summary);
      }
      setShareMessage('Resumen de cita copiado para compartir con tu cuidador o familia.');
    } catch {
      setShareMessage('Pase listo para mostrar al técnico TENS al llegar.');
    }
  };

  const handleDownloadPdf = () => {
    const filename = `Comprobante_LabExpress_${booking.orderNumber}.pdf`;
    const blob = generateAppointmentReceiptPdfBlob({
      booking,
      visitDate: draftDate,
      timeRange: currentSlot.range,
      accessNotes: draftAccessNotes,
      fastingStartTime: draftFastingStart,
      requiresFasting,
      exams: selectedExams,
      totalPaid,
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setDownloadMessage(`Comprobante PDF descargado: ${filename}`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#142132]">
      {/* Compact Sticky App Bar (56px height, well under 15% mobile cap) */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-[#e2e8f0]">
        <div className="max-w-[1100px] mx-auto h-full px-4 md:px-8 flex items-center justify-between gap-3">
          <button
            type="button"
            aria-label="Volver atrás"
            onClick={onBackToReceipt}
            className="min-h-[44px] min-w-[44px] -ml-2 px-2 rounded-lg inline-flex items-center gap-1 text-[#003366] font-semibold hover:bg-[#f0f6fa] transition-colors cursor-pointer clinical-focus"
          >
            <ChevronLeft className="w-6 h-6 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline text-base">Comprobante</span>
          </button>

          <h1 className="font-display text-base md:text-lg font-bold text-[#001e40] truncate">
            Pase Clínico y Ayuno
          </h1>

          <button
            type="button"
            onClick={handleSharePass}
            className="min-h-[44px] px-3 rounded-lg inline-flex items-center gap-1.5 text-sm md:text-base font-semibold text-[#006497] hover:bg-[#ebf5fb] transition-colors whitespace-nowrap shrink-0 cursor-pointer clinical-focus"
          >
            <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>Compartir</span>
          </button>
        </div>
      </header>

      <main className="max-w-[1100px] mx-auto px-5 md:px-8 py-6 md:py-10 space-y-6">
        {shareMessage && (
          <div
            role="status"
            className="rounded-xl bg-[#eaf8f0] border border-[#27ae60] px-4 py-3 text-sm md:text-base font-semibold text-[#196f3d] flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{shareMessage}</span>
          </div>
        )}

        {downloadMessage && (
          <div
            role="status"
            className="rounded-xl bg-[#ebf5fb] border border-[#2980b9] px-4 py-3 text-sm md:text-base font-semibold text-[#1b4f72] flex items-center gap-2"
          >
            <Download className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span>{downloadMessage}</span>
          </div>
        )}

        {/* Responsive 2-column layout on desktop, natural thumb-flow stack on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 5 Cols: Mobile Clinical Pass + QR + Fasting Monitor */}
          <div className="lg:col-span-5 space-y-6">
            {/* Digital Webpay Pass Card */}
            <section className="clinical-card rounded-2xl overflow-hidden">
              <div className="bg-[#003366] text-white p-5 flex items-center justify-between gap-4">
                <div>
                  <span className="block text-sm text-[#cce5ff]">Comprobante Webpay Plus</span>
                  <span className="font-display text-2xl font-bold tabular-nums">
                    #{booking.orderNumber}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eaf8f0] px-3 py-1 text-sm font-bold text-[#196f3d]">
                    <Check className="w-4 h-4 stroke-[2.5]" aria-hidden="true" />
                    Pagado
                  </span>
                  <span className="block mt-1 font-mono text-sm text-[#cce5ff] tabular-nums">
                    {formatClp(totalPaid)}
                  </span>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-display text-xl font-bold text-[#001e40]">
                      {booking.patientName}
                    </p>
                    <p className="font-mono text-sm text-[#43474f] tabular-nums">
                      RUT {booking.rut}
                    </p>
                    <p className="text-base font-semibold text-[#006497]">
                      {draftDate}
                    </p>
                    <p className="font-mono text-lg font-bold text-[#003366] tabular-nums">
                      {currentSlot.range}
                    </p>
                  </div>

                  {/* Deterministic Crisp Clinical QR SVG for TENS Scanner */}
                  <div
                    className="p-2.5 rounded-xl border border-[#cbd5e1] bg-white shrink-0"
                    aria-label="Código QR para escaneo del técnico TENS"
                  >
                    <svg
                      width="84"
                      height="84"
                      viewBox="0 0 21 21"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      role="img"
                      aria-label={`QR Orden ${booking.orderNumber}`}
                    >
                      <rect width="21" height="21" fill="#FFFFFF" />
                      <path
                        d="M1 1h7v7H1V1zm2 2v3h3V3H3zm10-2h7v7h-7V1zm2 2v3h3V3h-3zM1 13h7v7H1v-7zm2 2v3h3v-3H3zm6-12h2v2H9V3zm0 4h2v2H9V7zm2 2h2v2h-2V9zm-2 2h2v2H9v-2zm4-2h2v2h-2V9zm2 2h2v2h-2v-2zm2-2h2v2h-2V9zm-4 4h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-6 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2z"
                        fill="#001e40"
                      />
                    </svg>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#e2e8f0] text-base text-[#43474f] flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    <strong className="text-[#142132]">{booking.address}</strong>, {booking.comuna}
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleDownloadPdf}
                    className="w-full min-h-[52px] px-5 rounded-[10px] border-2 border-[#003366] text-[#003366] font-display font-bold text-base hover:bg-[#2980b9]/10 active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer clinical-focus"
                  >
                    <Download className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Descargar Comprobante</span>
                  </button>
                </div>
              </div>
            </section>

            {/* Interactive Fasting Clock & Checklist */}
            <section className="clinical-card rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-xl font-bold text-[#001e40]">
                  Calculadora de Ayuno Clínico
                </h2>
                {requiresFasting ? (
                  <FastingIndicator label="Ayuno Activo" />
                ) : (
                  <RoutineInstructionIndicator label="Sin Ayuno" />
                )}
              </div>

              {requiresFasting ? (
                <>
                  <div>
                    <label
                      htmlFor="fasting-start-time"
                      className="block text-base font-semibold text-[#142132] mb-1.5"
                    >
                      Hora de tu última comida hoy
                    </label>
                    <input
                      id="fasting-start-time"
                      type="time"
                      value={draftFastingStart}
                      onChange={(e) => setDraftFastingStart(e.target.value)}
                      className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white font-mono text-lg font-semibold text-[#001e40] tabular-nums focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                    />
                  </div>

                  <div className="rounded-xl bg-[#fdedeb] border border-[#e0564c] p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 text-[#9e2b25]">
                      <Clock className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <span className="text-base font-semibold">
                        Ayuno estimado al llegar el TENS:
                      </span>
                    </div>
                    <span className="font-display text-2xl font-bold text-[#9e2b25] tabular-nums whitespace-nowrap">
                      {calculatedFastingHours} hrs
                    </span>
                  </div>

                  <div className="space-y-2 text-base text-[#142132]">
                    <p className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#196f3d] shrink-0" aria-hidden="true" />
                      <span>Puedes beber agua pura sin gas.</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-[#9e2b25] shrink-0" aria-hidden="true" />
                      <span>Sin café, té, jugos ni chicles.</span>
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-base text-[#43474f]">
                  Tus exámenes actuales no requieren ayuno. Hidrátate normalmente con agua.
                </p>
              )}
            </section>
          </div>

          {/* Right 7 Cols: Appointment Modification & Caregiver Controls */}
          <div className="lg:col-span-7 space-y-6">
            <section className="clinical-card rounded-2xl p-6 md:p-7 space-y-6">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-[#001e40]">
                  Gestionar o modificar mi cita
                </h2>
                <p className="text-base text-[#43474f]">
                  Ajusta el día, la ventana horaria o las indicaciones de acceso para tu técnico TENS.
                </p>
              </div>

              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="mod-visit-date"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    Día de la visita a domicilio
                  </label>
                  <select
                    id="mod-visit-date"
                    value={draftDate}
                    onChange={(e) => {
                      setDraftDate(e.target.value);
                      setSaveMessage(null);
                    }}
                    className="w-full h-[54px] px-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                  >
                    {VISIT_DATE_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.label}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <fieldset className="space-y-2.5">
                  <legend className="text-base font-semibold text-[#142132] mb-1">
                    Ventana de llegada del técnico TENS
                  </legend>
                  <div className="space-y-2.5">
                    {TIME_SLOT_OPTIONS.map((slot) => {
                      const active = draftSlotId === slot.id;
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
                              name="mobile-slot"
                              checked={active}
                              onChange={() => {
                                setDraftSlotId(slot.id);
                                setSaveMessage(null);
                              }}
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

                <div>
                  <label
                    htmlFor="mod-access-notes"
                    className="block text-base font-semibold text-[#142132] mb-1.5"
                  >
                    Indicaciones de ingreso o conserjería
                  </label>
                  <textarea
                    id="mod-access-notes"
                    rows={3}
                    value={draftAccessNotes}
                    onChange={(e) => {
                      setDraftAccessNotes(e.target.value);
                      setSaveMessage(null);
                    }}
                    className="w-full p-4 rounded-[10px] border-[1.5px] border-[#94a3b8] bg-white text-base text-[#142132] focus:border-[#003366] focus:border-2 focus:bg-[#f0f6fa] focus:outline-none"
                  />
                </div>
              </div>

              {saveMessage && (
                <div
                  role="status"
                  className="rounded-xl bg-[#eaf8f0] border border-[#27ae60] p-4 flex items-center gap-2.5 text-base font-semibold text-[#196f3d]"
                >
                  <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
                  <span>{saveMessage}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="flex-1 min-h-[54px] px-6 rounded-[10px] bg-[#003366] text-white font-display font-bold text-[17px] hover:bg-[#001e40] transition-colors cursor-pointer clinical-focus"
                >
                  Guardar Cambios en mi Cita
                </button>

                <button
                  type="button"
                  onClick={onBackToHome}
                  className="flex-1 min-h-[54px] px-6 rounded-[10px] border-2 border-[#003366] text-[#003366] font-display font-bold text-[17px] hover:bg-[#2980b9]/10 transition-colors cursor-pointer clinical-focus"
                >
                  Volver al Inicio
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};
