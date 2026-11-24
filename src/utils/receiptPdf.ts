import { ClinicalExam, PatientBooking } from '../types';
import { formatClp } from '../data/clinicalData';

function toPdfAscii(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');
}

export function generateAppointmentReceiptPdfBlob(params: {
  booking: PatientBooking;
  visitDate: string;
  timeRange: string;
  accessNotes: string;
  fastingStartTime: string;
  requiresFasting: boolean;
  exams: ClinicalExam[];
  totalPaid: number;
}): Blob {
  const {
    booking,
    visitDate,
    timeRange,
    accessNotes,
    fastingStartTime,
    requiresFasting,
    exams,
    totalPaid,
  } = params;

  const lines: { text: string; size: number; bold?: boolean }[] = [
    { text: 'LABEXPRESS - COMPROBANTE DE ATENCION CLINICA A DOMICILIO', size: 13, bold: true },
    { text: '--------------------------------------------------------------------------', size: 10 },
    { text: `Orden de Atencion: #${booking.orderNumber}   |   Codigo Webpay: ${booking.webpayAuthCode}`, size: 10, bold: true },
    { text: `Estado de Pago: APROBADO (Redcompra **** ${booking.cardLastFour})`, size: 10 },
    { text: '', size: 8 },
    { text: 'DATOS DEL PACIENTE Y VISITA', size: 11, bold: true },
    { text: `Paciente: ${booking.patientName}`, size: 10 },
    { text: `RUT: ${booking.rut}   |   Telefono: ${booking.phone}`, size: 10 },
    { text: `Fecha Visita: ${visitDate}`, size: 10 },
    { text: `Ventana Horaria TENS: ${timeRange}`, size: 10, bold: true },
    { text: `Domicilio: ${booking.address}, ${booking.comuna}`, size: 10 },
    { text: `Indicaciones de Acceso: ${accessNotes || 'Sin observaciones'}`, size: 10 },
    { text: `TENS Asignado: ${booking.assignedTensName} (${booking.assignedTensSis})`, size: 10 },
    { text: '', size: 8 },
    { text: 'PROTOCOLO DE AYUNO CLINICO', size: 11, bold: true },
    {
      text: requiresFasting
        ? `Ayuno requerido: SI (8 a 12 hrs) - Ultima comida registrada: ${fastingStartTime} hrs`
        : 'Ayuno requerido: NO - Hidratacion habitual con agua pura.',
      size: 10,
    },
    { text: '', size: 8 },
    { text: 'EXAMENES SOLICITADOS', size: 11, bold: true },
    ...exams.map((exam) => ({
      text: `- ${exam.code} | ${exam.name} (${exam.fastingRequired ? 'Ayuno' : 'Sin ayuno'}) : ${formatClp(exam.priceClp)}`,
      size: 10,
    })),
    { text: `- Toma de muestra a domicilio : ${formatClp(exams.length > 0 ? booking.homeVisitFeeClp : 0)}`, size: 10 },
    { text: '--------------------------------------------------------------------------', size: 10 },
    { text: `TOTAL PAGADO WEBPAY PLUS: ${formatClp(totalPaid)} CLP`, size: 12, bold: true },
  ];

  let y = 760;
  const textCommands: string[] = ['BT'];
  for (const line of lines) {
    if (line.text) {
      const fontRef = line.bold ? '/F2' : '/F1';
      textCommands.push(`${fontRef} ${line.size} Tf`);
      textCommands.push(`1 0 0 1 48 ${y} Tm`);
      textCommands.push(`(${toPdfAscii(line.text)}) Tj`);
    }
    y -= line.size + 7;
    if (y < 48) break;
  }
  textCommands.push('ET');
  const streamContent = textCommands.join('\n');

  const objects: string[] = [
    '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
    '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n',
    `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`,
    '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
    '6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj;
  }

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdf], { type: 'application/pdf' });
}
