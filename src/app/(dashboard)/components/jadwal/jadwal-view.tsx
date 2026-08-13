'use client';

import { useState } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/id';
import { Plus } from 'lucide-react';
import { AppointmentModal } from '@/app/(dashboard)/components/jadwal/appointment-modal';
import { WeekCalendar } from '@/app/(dashboard)/components/jadwal/week-calendar';
import { PatientPicker } from '@/app/(dashboard)/components/monitor/patient-picker';
import { Button } from '@/components/ui/button';
import {
  formatAppointmentTitle,
  getDefaultAppointmentSlot,
  type AppointmentSlot,
} from '@/lib/appointment-utils';
import type { DoctorAppointment, MonitorPatientSummary } from '@/lib/backend';

dayjs.extend(isoWeek);
dayjs.locale('id');

type JadwalViewProps = {
  patients: MonitorPatientSummary[];
  activeId: number;
  initialAppointments: DoctorAppointment[];
};

export function JadwalView({ patients, activeId, initialAppointments }: JadwalViewProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf('isoWeek'));
  const [modalOpen, setModalOpen] = useState(false);
  const [draftSlot, setDraftSlot] = useState<AppointmentSlot>(() => getDefaultAppointmentSlot());
  const [notes, setNotes] = useState('');

  const draftTitle = formatAppointmentTitle(draftSlot);

  const openModal = (slot: AppointmentSlot) => {
    setDraftSlot(slot);
    setNotes('');
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const nextAppointment: DoctorAppointment = {
      id: `apt-${Date.now()}`,
      patientId: activeId,
      title: draftTitle,
      notes,
      start: draftSlot.start.toISOString(),
      end: draftSlot.end.toISOString(),
    };
    setAppointments((current) => [...current, nextAppointment]);
    setModalOpen(false);
    setNotes('');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 px-6 py-3 max-md:px-4">
        <PatientPicker patients={patients} activeId={activeId} basePath="/jadwal" />
        <Button
          size="sm"
          className="rounded-sm border-none px-4 bg-neutral-900 text-white hover:bg-neutral-600 hover:text-white"
          onClick={() => openModal(getDefaultAppointmentSlot())}
        >
          <Plus size={14} />
          Tambah
        </Button>
      </div>

      <WeekCalendar
        weekStart={weekStart}
        appointments={appointments}
        onWeekChange={setWeekStart}
        onSlotClick={openModal}
      />

      <AppointmentModal
        open={modalOpen}
        title={draftTitle}
        notes={notes}
        onNotesChange={setNotes}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
