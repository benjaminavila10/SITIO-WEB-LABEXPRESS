import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type UserRole = 'patient' | 'tens';

interface SessionClaims {
  sub: string;
  role: UserRole;
  name: string;
  identifier: string;
  iat: number;
  exp: number;
}

interface PatientAccount {
  id: string;
  name: string;
  rut: string;
  email: string;
  salt: string;
  passwordHash: string;
}

interface TensCredential {
  sisCode: string;
  name: string;
  salt: string;
  passcodeHash: string;
}

interface AuthenticatedRequest extends Request {
  auth?: SessionClaims;
}

interface ServerBookingRecord {
  ownerId: string;
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

interface ServerTensTube {
  id: string;
  barcode: string;
  label: string;
  capColor: string;
  scanned: boolean;
}

interface ServerTensStop {
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
  status: 'En Ruta' | 'En Domicilio' | 'Muestra Tomada' | 'Cadena de Frío OK';
  identityVerified: boolean;
  fastingVerified: boolean;
  coolerVerified: boolean;
  coolerTempC: number;
  tubes: ServerTensTube[];
}

const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

const patientsByEmail = new Map<string, PatientAccount>();
const patientsByRut = new Map<string, PatientAccount>();
const bookingsByOwner = new Map<string, ServerBookingRecord>();
let claimedTensCredential: TensCredential | null = null;

const EXAM_CATALOG_MAP = new Map<
  string,
  { name: string; fastingRequired: boolean; tubeType: string; tubeCapColor: string }
>([
  [
    'lipidico',
    {
      name: 'Perfil Lipídico Completo',
      fastingRequired: true,
      tubeType: 'Tubo Tapa Amarilla (Gel)',
      tubeCapColor: '#EAB308',
    },
  ],
  [
    'hemograma',
    {
      name: 'Hemograma Completo + VHS',
      fastingRequired: false,
      tubeType: 'Tubo EDTA Tapa Lila',
      tubeCapColor: '#8B5CF6',
    },
  ],
  [
    'glicemia',
    {
      name: 'Glicemia Basal e Insulina',
      fastingRequired: true,
      tubeType: 'Tubo Fluoruro Tapa Gris',
      tubeCapColor: '#64748B',
    },
  ],
  [
    'bioquimico',
    {
      name: 'Perfil Bioquímico (12 parámetros)',
      fastingRequired: true,
      tubeType: 'Tubo Tapa Amarilla (Gel)',
      tubeCapColor: '#EAB308',
    },
  ],
  [
    'tiroideo',
    {
      name: 'Perfil Tiroideo (TSH + T4 Libre)',
      fastingRequired: false,
      tubeType: 'Tubo Tapa Amarilla (Gel)',
      tubeCapColor: '#EAB308',
    },
  ],
  [
    'orina',
    {
      name: 'Orina Completa + Urocultivo',
      fastingRequired: false,
      tubeType: 'Frasco Estéril Tapa Roja',
      tubeCapColor: '#DC2626',
    },
  ],
  [
    'vitaminad',
    {
      name: 'Vitamina D (25-OH Colecalciferol)',
      fastingRequired: false,
      tubeType: 'Tubo Gel Protegido Luz',
      tubeCapColor: '#0284C7',
    },
  ],
  [
    'hba1c',
    {
      name: 'Hemoglobina Glicosilada (HbA1c)',
      fastingRequired: false,
      tubeType: 'Tubo EDTA Tapa Lila',
      tubeCapColor: '#8B5CF6',
    },
  ],
]);

const SLOT_RANGE_MAP = new Map<string, string>([
  ['slot-0700', '07:00 - 08:30 hrs'],
  ['slot-0830', '08:30 - 10:00 hrs'],
  ['slot-1000', '10:00 - 11:30 hrs'],
]);

const tensStops: ServerTensStop[] = [
  {
    id: 'stop-1',
    orderNumber: 'LX-904815',
    timeWindow: '07:00 - 07:45 hrs',
    patientName: 'Hernán Bustamante Toro',
    rut: '6.418.920-K',
    age: 74,
    comuna: 'Providencia',
    address: 'Pocuro 2180, Depto 202',
    phone: '+56 9 7234 1180',
    accessNotes: 'Hija (Claudia) abre portón principal.',
    requiresFasting: true,
    fastingHoursTarget: '10 hrs',
    exams: ['Perfil Lipídico Completo', 'Perfil Bioquímico (12 parámetros)'],
    status: 'Cadena de Frío OK',
    identityVerified: true,
    fastingVerified: true,
    coolerVerified: true,
    coolerTempC: 3.7,
    tubes: [
      { id: 't1', barcode: 'LX-2611-8801', label: 'Tubo Tapa Amarilla (Gel)', capColor: '#EAB308', scanned: true },
      { id: 't2', barcode: 'LX-2611-8802', label: 'Tubo Tapa Roja Seco', capColor: '#DC2626', scanned: true },
    ],
  },
  {
    id: 'stop-2',
    orderNumber: 'LX-904821',
    timeWindow: '07:45 - 08:30 hrs',
    patientName: 'Carmen Gloria Valdés',
    rut: '9.842.310-4',
    age: 68,
    comuna: 'Providencia',
    address: 'Av. Ricardo Lyon 1420, Depto 504',
    phone: '+56 9 8412 6390',
    accessNotes: 'Conserjería informada. Ascensor torre norte, tocar timbre 504.',
    requiresFasting: true,
    fastingHoursTarget: '10 a 12 hrs',
    exams: ['Perfil Lipídico Completo', 'Hemograma Completo + VHS', 'Glicemia Basal e Insulina'],
    status: 'En Domicilio',
    identityVerified: true,
    fastingVerified: false,
    coolerVerified: false,
    coolerTempC: 3.8,
    tubes: [
      { id: 't3', barcode: 'LX-2611-8841', label: 'Tubo Tapa Amarilla (Gel)', capColor: '#EAB308', scanned: false },
      { id: 't4', barcode: 'LX-2611-8842', label: 'Tubo EDTA Tapa Lila', capColor: '#8B5CF6', scanned: false },
      { id: 't5', barcode: 'LX-2611-8843', label: 'Tubo Fluoruro Tapa Gris', capColor: '#64748B', scanned: false },
    ],
  },
  {
    id: 'stop-3',
    orderNumber: 'LX-904829',
    timeWindow: '08:45 - 09:30 hrs',
    patientName: 'Matías Errázuriz Larraín',
    rut: '15.204.611-2',
    age: 42,
    comuna: 'Las Condes',
    address: 'Av. Apoquindo 4710, Casa B',
    phone: '+56 9 9102 4421',
    accessNotes: 'Estacionamiento de visitas disponible frente a portería.',
    requiresFasting: false,
    fastingHoursTarget: 'Sin ayuno',
    exams: ['Perfil Tiroideo (TSH + T4 Libre)', 'Vitamina D (25-OH Colecalciferol)'],
    status: 'En Ruta',
    identityVerified: false,
    fastingVerified: true,
    coolerVerified: false,
    coolerTempC: 3.8,
    tubes: [
      { id: 't6', barcode: 'LX-2611-8860', label: 'Tubo Tapa Amarilla (Gel)', capColor: '#EAB308', scanned: false },
      { id: 't7', barcode: 'LX-2611-8861', label: 'Tubo Gel Protegido Luz', capColor: '#0284C7', scanned: false },
    ],
  },
  {
    id: 'stop-4',
    orderNumber: 'LX-904834',
    timeWindow: '09:45 - 10:30 hrs',
    patientName: 'Rosa Elena Fuentes Palma',
    rut: '7.190.504-8',
    age: 79,
    comuna: 'Ñuñoa',
    address: 'Irarrázaval 3320, Depto 812',
    phone: '+56 9 6550 3912',
    accessNotes: 'Paciente con movilidad reducida. Llamar al llegar para bajar llave.',
    requiresFasting: true,
    fastingHoursTarget: '8 a 12 hrs',
    exams: ['Hemograma Completo + VHS', 'Hemoglobina Glicosilada (HbA1c)', 'Orina Completa + Urocultivo'],
    status: 'En Ruta',
    identityVerified: false,
    fastingVerified: false,
    coolerVerified: false,
    coolerTempC: 3.9,
    tubes: [
      { id: 't8', barcode: 'LX-2611-8872', label: 'Tubo EDTA Tapa Lila', capColor: '#8B5CF6', scanned: false },
      { id: 't9', barcode: 'LX-2611-8873', label: 'Frasco Estéril Tapa Roja', capColor: '#DC2626', scanned: false },
    ],
  },
];

function normalizeRut(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

function hashSecret(secret: string, salt: string): string {
  return crypto.scryptSync(secret, salt, 64).toString('hex');
}

function verifyScryptSecret(candidate: string, salt: string, storedHex: string): boolean {
  const candidateHex = hashSecret(candidate, salt);
  const a = Buffer.from(candidateHex, 'hex');
  const b = Buffer.from(storedHex, 'hex');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function verifyPlainSecretConstantTime(candidate: string, expected: string): boolean {
  const digestA = crypto.createHash('sha256').update(candidate).digest();
  const digestB = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(digestA, digestB);
}

function signSessionToken(claims: Omit<SessionClaims, 'iat' | 'exp'>): string {
  const now = Date.now();
  const fullClaims: SessionClaims = {
    ...claims,
    iat: now,
    exp: now + SESSION_TTL_MS,
  };
  const payloadB64 = Buffer.from(JSON.stringify(fullClaims), 'utf8').toString('base64url');
  const sigB64 = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  return `${payloadB64}.${sigB64}`;
}

function verifySessionToken(token: string): SessionClaims | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  if (!payloadB64 || !sigB64) return null;

  const expectedSigB64 = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');

  const sigBuf = Buffer.from(sigB64, 'utf8');
  const expectedBuf = Buffer.from(expectedSigB64, 'utf8');
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as SessionClaims;
    if (!parsed || typeof parsed.exp !== 'number' || parsed.exp <= Date.now()) {
      return null;
    }
    if (parsed.role !== 'patient' && parsed.role !== 'tens') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Debes iniciar sesión para acceder a este recurso.' });
    return;
  }
  const token = header.slice('Bearer '.length).trim();
  const claims = verifySessionToken(token);
  if (!claims) {
    res.status(401).json({ error: 'Tu sesión expiró o no es válida. Inicia sesión nuevamente.' });
    return;
  }
  req.auth = claims;
  next();
}

function requireTensRole(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.auth || req.auth.role !== 'tens') {
    res.status(403).json({
      error: 'Acceso restringido. Se requiere autenticación de Técnico TENS autorizado.',
    });
    return;
  }
  next();
}

function getEnvTensPasscode(): string {
  return (process.env.TENS_ACCESS_PASSCODE || '').trim();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/auth/status', (_req: Request, res: Response) => {
    const envPasscode = getEnvTensPasscode();
    res.json({
      envPasscodeActive: envPasscode.length > 0,
      tensConfigured: envPasscode.length > 0 || claimedTensCredential !== null,
      claimedSisCode: claimedTensCredential ? claimedTensCredential.sisCode : null,
    });
  });

  app.post('/api/auth/patient/register', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    const rut = typeof body.rut === 'string' ? body.rut.trim() : '';
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (name.length < 3 || name.length > 100) {
      res.status(400).json({ error: 'Ingresa tu nombre completo (mínimo 3 caracteres).' });
      return;
    }
    const normalizedRut = normalizeRut(rut);
    if (normalizedRut.length < 7 || normalizedRut.length > 10) {
      res.status(400).json({ error: 'Ingresa un RUT chileno válido (ej. 12.345.678-9).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) {
      res.status(400).json({ error: 'Ingresa un correo electrónico válido.' });
      return;
    }
    if (password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
      return;
    }

    if (patientsByEmail.has(email) || patientsByRut.has(normalizedRut)) {
      res.status(409).json({
        error: 'Ya existe una cuenta registrada con ese correo o RUT. Inicia sesión.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashSecret(password, salt);
    const account: PatientAccount = {
      id: `pat-${crypto.randomUUID()}`,
      name,
      rut,
      email,
      salt,
      passwordHash,
    };

    patientsByEmail.set(email, account);
    patientsByRut.set(normalizedRut, account);

    const token = signSessionToken({
      sub: account.id,
      role: 'patient',
      name: account.name,
      identifier: account.rut,
    });

    res.status(201).json({
      token,
      user: {
        id: account.id,
        role: 'patient',
        name: account.name,
        rut: account.rut,
        email: account.email,
      },
    });
  });

  app.post('/api/auth/patient/login', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const identifierRaw = typeof body.identifier === 'string' ? body.identifier.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifierRaw || !password) {
      res.status(400).json({ error: 'Ingresa tu correo o RUT y tu contraseña.' });
      return;
    }

    const byEmail = patientsByEmail.get(identifierRaw.toLowerCase());
    const byRut = patientsByRut.get(normalizeRut(identifierRaw));
    const account = byEmail || byRut;

    if (!account || !verifyScryptSecret(password, account.salt, account.passwordHash)) {
      res.status(401).json({ error: 'Correo/RUT o contraseña incorrectos.' });
      return;
    }

    const token = signSessionToken({
      sub: account.id,
      role: 'patient',
      name: account.name,
      identifier: account.rut,
    });

    res.json({
      token,
      user: {
        id: account.id,
        role: 'patient',
        name: account.name,
        rut: account.rut,
        email: account.email,
      },
    });
  });

  app.post('/api/auth/tens/claim', (req: Request, res: Response) => {
    if (getEnvTensPasscode().length > 0 || claimedTensCredential !== null) {
      res.status(409).json({
        error: 'El acceso TENS ya se encuentra configurado. Inicia sesión con tu clave operativa.',
      });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : 'Camila Rojas Mendoza';
    const sisCode = typeof body.sisCode === 'string' ? body.sisCode.trim().toUpperCase() : '';
    const passcode = typeof body.passcode === 'string' ? body.passcode : '';

    if (sisCode.length < 3 || sisCode.length > 24) {
      res.status(400).json({ error: 'Ingresa un número de registro SIS válido (ej. SIS-48210).' });
      return;
    }
    if (passcode.length < 8 || passcode.length > 128) {
      res.status(400).json({ error: 'La clave operativa TENS debe tener al menos 8 caracteres.' });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passcodeHash = hashSecret(passcode, salt);
    claimedTensCredential = {
      sisCode,
      name: name || 'Camila Rojas Mendoza',
      salt,
      passcodeHash,
    };

    const token = signSessionToken({
      sub: `tens-${claimedTensCredential.sisCode}`,
      role: 'tens',
      name: claimedTensCredential.name,
      identifier: claimedTensCredential.sisCode,
    });

    res.status(201).json({
      token,
      user: {
        id: `tens-${claimedTensCredential.sisCode}`,
        role: 'tens',
        name: claimedTensCredential.name,
        sisCode: claimedTensCredential.sisCode,
      },
    });
  });

  app.post('/api/auth/tens/login', (req: Request, res: Response) => {
    const body = req.body as Record<string, unknown>;
    const sisCode = typeof body.sisCode === 'string' ? body.sisCode.trim().toUpperCase() : '';
    const passcode = typeof body.passcode === 'string' ? body.passcode : '';

    if (!sisCode || !passcode) {
      res.status(400).json({ error: 'Ingresa tu Registro SIS y clave operativa TENS.' });
      return;
    }

    const envPasscode = getEnvTensPasscode();
    let authorized = false;
    let operatorName = 'Camila Rojas Mendoza';

    if (envPasscode.length > 0) {
      authorized = verifyPlainSecretConstantTime(passcode, envPasscode);
    } else if (claimedTensCredential !== null) {
      const matchesSis = sisCode === claimedTensCredential.sisCode;
      const matchesPass = verifyScryptSecret(
        passcode,
        claimedTensCredential.salt,
        claimedTensCredential.passcodeHash
      );
      authorized = matchesSis && matchesPass;
      operatorName = claimedTensCredential.name;
    } else {
      res.status(409).json({
        error: 'Aún no se ha configurado la clave operativa TENS. Completa el registro inicial.',
      });
      return;
    }

    if (!authorized) {
      res.status(401).json({ error: 'Credenciales TENS inválidas.' });
      return;
    }

    const token = signSessionToken({
      sub: `tens-${sisCode}`,
      role: 'tens',
      name: operatorName,
      identifier: sisCode,
    });

    res.json({
      token,
      user: {
        id: `tens-${sisCode}`,
        role: 'tens',
        name: operatorName,
        sisCode,
      },
    });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.auth });
  });

  app.get('/api/bookings/current', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const ownerId = req.auth!.sub;
    const existing = bookingsByOwner.get(ownerId) || null;
    res.json({ booking: existing });
  });

  app.post('/api/bookings', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const auth = req.auth!;
    const body = req.body as Record<string, unknown>;

    const patientName = typeof body.patientName === 'string' ? body.patientName.trim() : '';
    const rut = typeof body.rut === 'string' ? body.rut.trim() : '';
    const phone = typeof body.phone === 'string' ? body.phone.trim() : '';
    const comuna = typeof body.comuna === 'string' ? body.comuna.trim() : '';
    const address = typeof body.address === 'string' ? body.address.trim() : '';
    const accessNotes = typeof body.accessNotes === 'string' ? body.accessNotes.trim() : '';
    const visitDateLabel = typeof body.visitDateLabel === 'string' ? body.visitDateLabel.trim() : '';
    const timeSlotId = typeof body.timeSlotId === 'string' ? body.timeSlotId.trim() : 'slot-0700';
    const fastingStartTime = typeof body.fastingStartTime === 'string' ? body.fastingStartTime.trim() : '21:00';
    const selectedExamIds = Array.isArray(body.selectedExamIds)
      ? body.selectedExamIds.filter((id): id is string => typeof id === 'string' && EXAM_CATALOG_MAP.has(id))
      : [];

    if (!patientName || !rut || !address || selectedExamIds.length === 0) {
      res.status(400).json({ error: 'Datos incompletos para registrar la orden clínica.' });
      return;
    }

    const orderNumber =
      typeof body.orderNumber === 'string' && /^LX-\d{6}$/.test(body.orderNumber)
        ? body.orderNumber
        : `LX-${Math.floor(904800 + Math.random() * 190)}`;
    const webpayAuthCode =
      typeof body.webpayAuthCode === 'string' && /^\d{6}$/.test(body.webpayAuthCode)
        ? body.webpayAuthCode
        : String(Math.floor(100000 + Math.random() * 899999));

    const record: ServerBookingRecord = {
      ownerId: auth.sub,
      orderNumber,
      webpayAuthCode,
      cardLastFour: '4512',
      paidAtIso: new Date().toISOString(),
      patientName: patientName.slice(0, 120),
      rut: rut.slice(0, 20),
      phone: phone.slice(0, 30),
      comuna: comuna.slice(0, 60),
      address: address.slice(0, 180),
      accessNotes: accessNotes.slice(0, 300),
      visitDateLabel: visitDateLabel.slice(0, 80),
      timeSlotId: SLOT_RANGE_MAP.has(timeSlotId) ? timeSlotId : 'slot-0700',
      selectedExamIds,
      homeVisitFeeClp: 5900,
      fastingStartTime: fastingStartTime.slice(0, 10),
      assignedTensName: 'Camila Rojas Mendoza',
      assignedTensSis: 'SIS #48210',
    };

    bookingsByOwner.set(auth.sub, record);

    const examDetails = selectedExamIds
      .map((id) => EXAM_CATALOG_MAP.get(id))
      .filter((item): item is NonNullable<typeof item> => Boolean(item));
    const requiresFasting = examDetails.some((e) => e.fastingRequired);
    const stopIndex = tensStops.findIndex((s) => s.id === 'stop-2');
    const updatedStop: ServerTensStop = {
      id: 'stop-2',
      orderNumber: record.orderNumber,
      timeWindow: SLOT_RANGE_MAP.get(record.timeSlotId) || '07:00 - 08:30 hrs',
      patientName: record.patientName,
      rut: record.rut,
      age: 68,
      comuna: record.comuna,
      address: record.address,
      phone: record.phone,
      accessNotes: record.accessNotes,
      requiresFasting,
      fastingHoursTarget: requiresFasting ? '8 a 12 hrs' : 'Sin ayuno',
      exams: examDetails.map((e) => e.name),
      status: 'En Domicilio',
      identityVerified: true,
      fastingVerified: !requiresFasting,
      coolerVerified: false,
      coolerTempC: 3.8,
      tubes: examDetails.map((e, idx) => ({
        id: `dyn-t-${idx}`,
        barcode: `LX-2611-${8841 + idx}`,
        label: e.tubeType,
        capColor: e.tubeCapColor,
        scanned: false,
      })),
    };

    if (stopIndex === -1) {
      tensStops.unshift(updatedStop);
    } else {
      tensStops[stopIndex] = updatedStop;
    }

    res.status(201).json({ booking: record });
  });

  app.get('/api/tens/stops', requireAuth, requireTensRole, (_req: AuthenticatedRequest, res: Response) => {
    res.json({ stops: tensStops });
  });

  app.patch('/api/tens/stops/:stopId', requireAuth, requireTensRole, (req: AuthenticatedRequest, res: Response) => {
    const { stopId } = req.params;
    const stop = tensStops.find((s) => s.id === stopId);
    if (!stop) {
      res.status(404).json({ error: 'Domicilio no encontrado en la ruta.' });
      return;
    }

    const body = req.body as Record<string, unknown>;
    const allowedStatuses = new Set<ServerTensStop['status']>([
      'En Ruta',
      'En Domicilio',
      'Muestra Tomada',
      'Cadena de Frío OK',
    ]);

    if (typeof body.status === 'string' && allowedStatuses.has(body.status as ServerTensStop['status'])) {
      stop.status = body.status as ServerTensStop['status'];
      if (stop.status === 'Cadena de Frío OK') {
        stop.identityVerified = true;
        stop.fastingVerified = true;
        stop.coolerVerified = true;
        stop.tubes = stop.tubes.map((t) => ({ ...t, scanned: true }));
      }
    }
    if (typeof body.identityVerified === 'boolean') {
      stop.identityVerified = body.identityVerified;
    }
    if (typeof body.fastingVerified === 'boolean') {
      stop.fastingVerified = body.fastingVerified;
    }
    if (typeof body.coolerVerified === 'boolean') {
      stop.coolerVerified = body.coolerVerified;
    }
    if (typeof body.toggleTubeId === 'string') {
      stop.tubes = stop.tubes.map((t) =>
        t.id === body.toggleTubeId ? { ...t, scanned: !t.scanned } : t
      );
    }

    res.json({ stop });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`LabExpress server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start LabExpress server:', err);
  process.exit(1);
});
