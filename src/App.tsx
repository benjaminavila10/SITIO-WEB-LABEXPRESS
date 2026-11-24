/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import {
  CLINICAL_EXAMS,
  INITIAL_BOOKING,
  INITIAL_TENS_STOPS,
  TIME_SLOT_OPTIONS,
} from './data/clinicalData';
import {
  AuthUser,
  PatientBooking,
  ScreenId,
  TensRouteStop,
  TensStopStatus,
  TransitionDirection,
} from './types';
import { LoginGateScreen } from './screens/LoginGateScreen';
import { TensLoginScreen } from './screens/TensLoginScreen';
import { PatientPortalScreen } from './screens/PatientPortalScreen';
import { TensPortalScreen } from './screens/TensPortalScreen';
import { WebpayReceiptScreen } from './screens/WebpayReceiptScreen';
import { MobileReceiptScreen } from './screens/MobileReceiptScreen';

interface AuthSession {
  token: string;
  user: AuthUser;
}

const SCREEN_TITLES: Record<ScreenId, string> = {
  'portal-pacientes': 'LabExpress - Portal Pacientes y Toma a Domicilio',
  'portal-tens': 'LabExpress - Portal Operativo Técnico TENS en Terreno',
  'comprobante-webpay': 'LabExpress - Comprobante de Pago Webpay y Preparación de Ayuno',
  'comprobante-movil': 'LabExpress - Comprobante Móvil Webpay y Ayuno Clínico',
};

const slideVariants = {
  enter: (direction: TransitionDirection) => ({
    x: direction === 'push' ? 28 : -28,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: TransitionDirection) => ({
    x: direction === 'push' ? -28 : 28,
    opacity: 0,
  }),
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('portal-pacientes');
  const [direction, setDirection] = useState<TransitionDirection>('push');
  const [patientSession, setPatientSession] = useState<AuthSession | null>(null);
  const [tensSession, setTensSession] = useState<AuthSession | null>(null);
  const [booking, setBooking] = useState<PatientBooking>(INITIAL_BOOKING);
  const [tensStops, setTensStops] = useState<TensRouteStop[]>(INITIAL_TENS_STOPS);

  useEffect(() => {
    if (activeScreen === 'portal-tens' && !tensSession) {
      document.title = 'LabExpress - Acceso Técnico TENS';
    } else if (activeScreen !== 'portal-tens' && !patientSession) {
      document.title = 'LabExpress - Iniciar Sesión';
    } else {
      document.title = SCREEN_TITLES[activeScreen];
    }
  }, [activeScreen, patientSession, tensSession]);

  const navigateTo = useCallback((target: ScreenId, transition: TransitionDirection) => {
    setDirection(transition);
    setActiveScreen(target);
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const syncBookingToLocalStop = useCallback((updatedBooking: PatientBooking) => {
    const selectedExamObjs = CLINICAL_EXAMS.filter((e) =>
      updatedBooking.selectedExamIds.includes(e.id)
    );
    const slot =
      TIME_SLOT_OPTIONS.find((s) => s.id === updatedBooking.timeSlotId) || TIME_SLOT_OPTIONS[0];
    const requiresFasting = selectedExamObjs.some((e) => e.fastingRequired);

    setTensStops((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === 'stop-2');
      const nextStop: TensRouteStop = {
        id: 'stop-2',
        orderNumber: updatedBooking.orderNumber,
        timeWindow: slot.range,
        patientName: updatedBooking.patientName,
        rut: updatedBooking.rut,
        age: 68,
        comuna: updatedBooking.comuna,
        address: updatedBooking.address,
        phone: updatedBooking.phone,
        accessNotes: updatedBooking.accessNotes,
        requiresFasting,
        fastingHoursTarget: requiresFasting ? '8 a 12 hrs' : 'Sin ayuno',
        exams: selectedExamObjs.map((e) => e.name),
        status: 'En Domicilio',
        identityVerified: true,
        fastingVerified: !requiresFasting,
        coolerVerified: false,
        coolerTempC: 3.8,
        tubes: selectedExamObjs.map((e, idx) => ({
          id: `dyn-t-${idx}`,
          barcode: `LX-2611-${8841 + idx}`,
          label: e.tubeType,
          capColor: e.tubeCapColor,
          scanned: false,
        })),
      };

      if (existingIndex === -1) {
        return [nextStop, ...prev];
      }
      const copy = [...prev];
      copy[existingIndex] = nextStop;
      return copy;
    });
  }, []);

  const fetchTensStops = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/tens/stops', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = (await res.json()) as { stops?: TensRouteStop[] };
      if (Array.isArray(data.stops)) {
        setTensStops(data.stops);
      }
    } catch {
      // Keep current state on transient network failure
    }
  }, []);

  const handlePatientAuthenticated = useCallback(
    async (token: string, user: AuthUser) => {
      setPatientSession({ token, user });
      setBooking((prev) => ({
        ...prev,
        patientName: user.name || prev.patientName,
        rut: user.rut || prev.rut,
      }));
      try {
        const res = await fetch('/api/bookings/current', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = (await res.json()) as { booking?: PatientBooking | null };
          if (data.booking) {
            setBooking(data.booking);
          }
        }
      } catch {
        // Default booking remains populated with user's name and RUT
      }
    },
    []
  );

  const handleTensAuthenticated = useCallback(
    async (token: string, user: AuthUser) => {
      setTensSession({ token, user });
      await fetchTensStops(token);
      navigateTo('portal-tens', 'push');
    },
    [fetchTensStops, navigateTo]
  );

  const persistBookingOnServer = useCallback(
    async (nextBooking: PatientBooking, token: string) => {
      try {
        const res = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(nextBooking),
        });
        if (res.ok) {
          const data = (await res.json()) as { booking?: PatientBooking };
          if (data.booking) {
            setBooking(data.booking);
          }
        }
      } catch {
        // Local booking already updated
      }
    },
    []
  );

  const handleUpdateBooking = useCallback(
    (partial: Partial<PatientBooking>) => {
      setBooking((prev) => {
        const next = { ...prev, ...partial };
        syncBookingToLocalStop(next);
        if (patientSession && activeScreen === 'comprobante-movil') {
          void persistBookingOnServer(next, patientSession.token);
        }
        return next;
      });
    },
    [activeScreen, patientSession, persistBookingOnServer, syncBookingToLocalStop]
  );

  const handleCompleteWebpay = useCallback(
    (completedBooking: PatientBooking) => {
      setBooking(completedBooking);
      syncBookingToLocalStop(completedBooking);
      if (patientSession) {
        void persistBookingOnServer(completedBooking, patientSession.token);
      }
      navigateTo('comprobante-webpay', 'push');
    },
    [navigateTo, patientSession, persistBookingOnServer, syncBookingToLocalStop]
  );

  const handlePatchStop = useCallback(
    async (
      stopId: string,
      patch: {
        status?: TensStopStatus;
        identityVerified?: boolean;
        fastingVerified?: boolean;
        coolerVerified?: boolean;
        toggleTubeId?: string;
      }
    ) => {
      if (!tensSession) return;
      try {
        const res = await fetch(`/api/tens/stops/${encodeURIComponent(stopId)}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tensSession.token}`,
          },
          body: JSON.stringify(patch),
        });
        if (res.status === 401 || res.status === 403) {
          setTensSession(null);
          return;
        }
        if (res.ok) {
          const data = (await res.json()) as { stop?: TensRouteStop };
          if (data.stop) {
            setTensStops((prev) => prev.map((s) => (s.id === stopId ? data.stop! : s)));
          }
        }
      } catch {
        // Ignore transient network error
      }
    },
    [tensSession]
  );

  const handleLogoutPatient = useCallback(() => {
    setPatientSession(null);
    setBooking(INITIAL_BOOKING);
    navigateTo('portal-pacientes', 'push_back');
  }, [navigateTo]);

  const handleLogoutTens = useCallback(() => {
    setTensSession(null);
    navigateTo('portal-pacientes', 'push_back');
  }, [navigateTo]);

  const renderScreenKey =
    activeScreen === 'portal-tens'
      ? tensSession
        ? 'portal-tens-authed'
        : 'portal-tens-login'
      : patientSession
      ? activeScreen
      : 'patient-login-gate';

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-[#f8f9fa] overflow-x-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={renderScreenKey}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeScreen === 'portal-tens' ? (
              tensSession ? (
                <TensPortalScreen
                  stops={tensStops}
                  activeBooking={booking}
                  tensUserName={tensSession.user.name}
                  tensSisCode={tensSession.user.sisCode}
                  onPatchStop={handlePatchStop}
                  onNavigatePatients={() => navigateTo('portal-pacientes', 'push_back')}
                  onLogoutTens={handleLogoutTens}
                />
              ) : (
                <TensLoginScreen
                  onTensAuthenticated={handleTensAuthenticated}
                  onNavigatePatients={() => navigateTo('portal-pacientes', 'push_back')}
                />
              )
            ) : !patientSession ? (
              <LoginGateScreen
                onAuthenticated={handlePatientAuthenticated}
                onRequestTensPortal={() => navigateTo('portal-tens', 'push')}
              />
            ) : (
              <>
                {activeScreen === 'portal-pacientes' && (
                  <PatientPortalScreen
                    booking={booking}
                    onUpdateBooking={handleUpdateBooking}
                    onNavigateTens={() => navigateTo('portal-tens', 'push')}
                    onCompleteWebpay={handleCompleteWebpay}
                    onLogout={handleLogoutPatient}
                  />
                )}

                {activeScreen === 'comprobante-webpay' && (
                  <WebpayReceiptScreen
                    booking={booking}
                    onNavigatePatients={() => navigateTo('portal-pacientes', 'push_back')}
                    onNavigateTens={() => navigateTo('portal-tens', 'push')}
                    onNavigateMobilePass={() => navigateTo('comprobante-movil', 'push')}
                  />
                )}

                {activeScreen === 'comprobante-movil' && (
                  <MobileReceiptScreen
                    booking={booking}
                    onUpdateBooking={handleUpdateBooking}
                    onBackToReceipt={() => navigateTo('comprobante-webpay', 'push_back')}
                    onBackToHome={() => navigateTo('portal-pacientes', 'push_back')}
                  />
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
