export type ScreenId =
  | 'portal-pacientes'
  | 'portal-tens'
  | 'comprobante-webpay'
  | 'comprobante-movil';

export type TransitionDirection = 'push' | 'push_back';

export type ExamCategory = 'Todos' | 'Chequeo General' | 'Ayuno Requerido' | 'Sin Ayuno';

export interface ClinicalExam {
  id: string;
  code: string;
  name: string;
  category: Exclude<ExamCategory, 'Todos'>;
  description: string;
  priceClp: number;
  fastingRequired: boolean;
  fastingHours?: string;
  specialInstruction: string;
  tubeType: string;
  tubeCapColor: string;
  turnaroundHours: number;
}

export interface TimeSlotOption {
  id: string;
  range: string;
  tag: string;
  recommendedForFasting: boolean;
}

export interface PatientBooking {
  orderNumber: string;
  webpayAuthCode: string;
  cardLastFour: string;
  paidAtIso: string;
  patientName: string;
  rut: string;
  phone: string;
  comuna: string;
  address: string;
  accessNotes: string;
  visitDateLabel: string;
  timeSlotId: string;
  selectedExamIds: string[];
  homeVisitFeeClp: number;
  fastingStartTime: string;
  assignedTensName: string;
  assignedTensSis: string;
}

export type TensStopStatus = 'En Ruta' | 'En Domicilio' | 'Muestra Tomada' | 'Cadena de Frío OK';

export interface TensTubeSample {
  id: string;
  barcode: string;
  label: string;
  capColor: string;
  scanned: boolean;
}

export interface TensRouteStop {
  id: string;
  orderNumber: string;
  timeWindow: string;
  patientName: string;
  rut: string;
  age: number;
  comuna: string;
  address: string;
  phone: string;
  accessNotes: string;
  requiresFasting: boolean;
  fastingHoursTarget: string;
  exams: string[];
  status: TensStopStatus;
  identityVerified: boolean;
  fastingVerified: boolean;
  coolerVerified: boolean;
  coolerTempC: number;
  tubes: TensTubeSample[];
}

export type AuthUserRole = 'patient' | 'tens';

export interface AuthUser {
  id: string;
  role: AuthUserRole;
  name: string;
  rut?: string;
  email?: string;
  sisCode?: string;
}

export interface TensAuthStatus {
  envPasscodeActive: boolean;
  tensConfigured: boolean;
  claimedSisCode: string | null;
}
