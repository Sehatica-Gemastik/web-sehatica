import {
  backendRequest,
  type DailyQuestionnaireLog,
  type DoctorAppointment,
  type DoctorProfile,
  type MonitorPatientDetail,
  type MonitorPatientSummary,
  type MonitorRecordItem,
} from './backend';

export async function getDoctorProfile(token: string) {
  return backendRequest<DoctorProfile>('/portal/me', {}, token);
}

export async function updateDoctorProfileApi(
  token: string,
  input: { name: string; phone: string; specialty: string; bio: string },
) {
  return backendRequest<DoctorProfile>('/portal/me', {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, token);
}

export async function getPartnerPatients(token: string) {
  return backendRequest<MonitorPatientSummary[]>('/portal/patients', {}, token);
}

export async function getPatientMonitorDetail(token: string, patientId: number) {
  return backendRequest<MonitorPatientDetail>(`/portal/patients/${patientId}`, {}, token);
}

export async function getLatestQuestionnaireSummary(token: string, patientId: number) {
  return backendRequest<{ date: string; summary: string } | null>(
    `/portal/patients/${patientId}/questionnaires/latest-summary`,
    {},
    token,
  );
}

export async function getDailyQuestionnaireLog(token: string, patientId: number, date: string) {
  return backendRequest<DailyQuestionnaireLog>(
    `/portal/patients/${patientId}/questionnaires/${date}`,
    {},
    token,
  );
}

export async function getDoctorAppointments(
  token: string,
  patientId: number,
  from?: string,
  to?: string,
) {
  const params = new URLSearchParams({ patientId: String(patientId) });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  return backendRequest<DoctorAppointment[]>(`/portal/appointments?${params}`, {}, token);
}

export async function createDoctorAppointmentApi(
  token: string,
  input: Omit<DoctorAppointment, 'id'>,
) {
  return backendRequest<DoctorAppointment>('/portal/appointments', {
    method: 'POST',
    body: JSON.stringify(input),
  }, token);
}

export async function updateDoctorAppointmentApi(
  token: string,
  id: string,
  input: Omit<DoctorAppointment, 'id'>,
) {
  return backendRequest<DoctorAppointment>(`/portal/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, token);
}

export async function deleteDoctorAppointmentApi(token: string, id: string) {
  return backendRequest<{ deleted: boolean }>(`/portal/appointments/${id}`, {
    method: 'DELETE',
  }, token);
}

export async function createPatientRecordApi(
  token: string,
  patientId: number,
  input: {
    title: string;
    fileName: string;
    fileBase64: string;
    type?: 'consultation' | 'image' | 'voice' | 'note';
  },
) {
  return backendRequest<MonitorRecordItem>(`/portal/patients/${patientId}/records`, {
    method: 'POST',
    body: JSON.stringify({
      type: input.type ?? 'image',
      title: input.title,
      fileName: input.fileName,
      fileBase64: input.fileBase64,
    }),
  }, token);
}

export async function deletePatientRecordApi(
  token: string,
  patientId: number,
  recordId: number,
) {
  return backendRequest<{ deleted: boolean }>(
    `/portal/patients/${patientId}/records/${recordId}`,
    { method: 'DELETE' },
    token,
  );
}

export async function revokePartnerPatientApi(token: string, patientId: number) {
  return backendRequest<{ deleted: boolean }>(`/portal/patients/${patientId}`, {
    method: 'DELETE',
  }, token);
}
