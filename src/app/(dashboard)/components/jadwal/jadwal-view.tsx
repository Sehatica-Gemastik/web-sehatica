'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dayjs, { type Dayjs } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import 'dayjs/locale/id';
import { Plus } from 'lucide-react';
import { createAppointment, deleteAppointment, updateAppointment } from '@/app/actions';
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
  const router = useRouter();
  const [appointments, setAppointments] = useState(initialAppointments);
  const [weekStart, setWeekStart] = useState(() => dayjs().startOf('isoWeek'));
  const [modalOpen, setModalOpen] = useState(false);
  const [draftSlot, setDraftSlot] = useState<AppointmentSlot>(() => getDefaultAppointmentSlot());
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [deleteTransitionPending, startDeleteTransition] = useTransition();

  useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const mode = editingAppointmentId ? 'edit' : 'create';

  const toLocalInput = (value: Dayjs) => value.format('YYYY-MM-DDTHH:mm');
  const parseLocalInput = (value: string) => dayjs(value);
  const inputStart = parseLocalInput(startInput);
  const inputEnd = parseLocalInput(endInput);
  const draftTitle = inputStart.isValid() && inputEnd.isValid()
    ? formatAppointmentTitle({ start: inputStart, end: inputEnd })
    : formatAppointmentTitle(draftSlot);

  const openModal = (slot: AppointmentSlot) => {
    setEditingAppointmentId(null);
    setDraftSlot(slot);
    setStartInput(toLocalInput(slot.start));
    setEndInput(toLocalInput(slot.end));
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (appointment: DoctorAppointment) => {
    const start = dayjs(appointment.start);
    const end = dayjs(appointment.end);
    setEditingAppointmentId(appointment.id);
    setDraftSlot({ start, end });
    setStartInput(toLocalInput(start));
    setEndInput(toLocalInput(end));
    setNotes(appointment.notes ?? '');
    setModalOpen(true);
  };

  const handleSubmit = () => {
    const start = parseLocalInput(startInput);
    const end = parseLocalInput(endInput);
    if (!start.isValid() || !end.isValid()) {
      setError('Waktu mulai/selesai tidak valid');
      return;
    }
    if (!end.isAfter(start)) {
      setError('Waktu selesai harus setelah waktu mulai');
      return;
    }

    const slot = { start, end };
    const title = formatAppointmentTitle(slot);
    setDraftSlot(slot);

    startTransition(async () => {
      setError(null);
      try {
        if (editingAppointmentId) {
          await updateAppointment({
            id: editingAppointmentId,
            patientId: activeId,
            title,
            notes,
            start: start.toISOString(),
            end: end.toISOString(),
          });
        } else {
          await createAppointment({
            patientId: activeId,
            title,
            notes,
            start: start.toISOString(),
            end: end.toISOString(),
          });
        }
        setModalOpen(false);
        setEditingAppointmentId(null);
        setNotes('');
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan janji');
      }
    });
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
        onEventClick={openEditModal}
      />

      <AppointmentModal
        open={modalOpen}
        mode={mode}
        title={draftTitle}
        notes={notes}
        startValue={startInput}
        endValue={endInput}
        onNotesChange={setNotes}
        onStartChange={setStartInput}
        onEndChange={setEndInput}
        onClose={() => { setModalOpen(false); setEditingAppointmentId(null); }}
        onSubmit={handleSubmit}
        onDelete={editingAppointmentId ? () => {
          const id = editingAppointmentId;
          startDeleteTransition(async () => {
            try {
              await deleteAppointment(id);
              setModalOpen(false);
              setEditingAppointmentId(null);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Gagal menghapus janji');
            }
          });
        } : undefined}
        submitting={pending}
        deleting={deleteTransitionPending}
        error={error}
      />
    </div>
  );
}
