type LogRow = {
  id: string;
  status: string;
  errorMessage: string | null;
  createdAt: Date;
  responsePayload: unknown;
};

type QueueRow = {
  id: string;
  status: string;
  retries: number;
  maxRetries: number;
  lastError: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type VerifactuTimelineEventDto = {
  id: string;
  kind:
    | 'enqueued'
    | 'processing'
    | 'forwarded'
    | 'aeat_success'
    | 'aeat_error'
    | 'completed'
    | 'failed'
    | 'retry';
  label: string;
  detail: string | null;
  at: string;
};

export function buildVerifactuTimeline(
  queueItems: QueueRow[],
  logs: LogRow[],
): VerifactuTimelineEventDto[] {
  const events: VerifactuTimelineEventDto[] = [];

  for (const q of queueItems) {
    events.push({
      id: `queue-created-${q.id}`,
      kind: 'enqueued',
      label: 'Encolada para AEAT',
      detail: `Estado inicial · máx. ${q.maxRetries} reintentos`,
      at: q.createdAt.toISOString(),
    });

    if (q.status === 'PROCESSING') {
      events.push({
        id: `queue-processing-${q.id}`,
        kind: 'processing',
        label: 'Worker procesando envío',
        detail: null,
        at: q.updatedAt.toISOString(),
      });
    }

    if (q.status === 'FORWARDED') {
      events.push({
        id: `queue-forwarded-${q.id}`,
        kind: 'forwarded',
        label: 'Reenviada al worker ERP',
        detail: null,
        at: q.updatedAt.toISOString(),
      });
    }

    if (q.retries > 0) {
      events.push({
        id: `queue-retry-${q.id}-${q.retries}`,
        kind: 'retry',
        label: `Reintento ${q.retries} / ${q.maxRetries}`,
        detail: q.lastError,
        at: q.updatedAt.toISOString(),
      });
    }

    if (q.status === 'COMPLETED') {
      events.push({
        id: `queue-completed-${q.id}`,
        kind: 'completed',
        label: 'Cola completada',
        detail: 'Envío AEAT finalizado',
        at: q.updatedAt.toISOString(),
      });
    }

    if (q.status === 'FAILED') {
      events.push({
        id: `queue-failed-${q.id}`,
        kind: 'failed',
        label: 'Cola con error definitivo',
        detail: q.lastError,
        at: q.updatedAt.toISOString(),
      });
    }
  }

  for (const log of logs) {
    const response = log.responsePayload as {
      verificationCode?: string;
      ack?: { aeat?: { idRegistro?: string; csv?: string } };
    } | null;

    const ref =
      response?.ack?.aeat?.idRegistro?.trim() ||
      response?.ack?.aeat?.csv?.trim() ||
      response?.verificationCode?.trim() ||
      null;

    if (log.status === 'SUCCESS') {
      events.push({
        id: `log-success-${log.id}`,
        kind: 'aeat_success',
        label: 'Respuesta AEAT correcta',
        detail: ref ? `Ref. ${ref}` : null,
        at: log.createdAt.toISOString(),
      });
    } else {
      events.push({
        id: `log-error-${log.id}`,
        kind: 'aeat_error',
        label: 'Error en envío AEAT',
        detail: log.errorMessage,
        at: log.createdAt.toISOString(),
      });
    }
  }

  return events.sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
}

export function resolveVerifactuInvoiceStatus(
  queueItems: QueueRow[],
  logs: LogRow[],
): 'pending' | 'sent' | 'error' | 'none' {
  const latestQueue = queueItems[queueItems.length - 1];
  if (latestQueue) {
    if (latestQueue.status === 'COMPLETED') {
      return 'sent';
    }
    if (latestQueue.status === 'FAILED') {
      return 'error';
    }
    if (['PENDING', 'PROCESSING', 'FORWARDED'].includes(latestQueue.status)) {
      return 'pending';
    }
  }

  const latestLog = logs[logs.length - 1];
  if (latestLog?.status === 'SUCCESS') {
    return 'sent';
  }
  if (latestLog?.status === 'ERROR') {
    return 'error';
  }

  return queueItems.length > 0 || logs.length > 0 ? 'pending' : 'none';
}

export function extractAeatFieldsFromLog(log: LogRow | undefined): {
  aeatReference: string | null;
  verificationCode: string | null;
  currentHash: string | null;
} {
  if (!log) {
    return { aeatReference: null, verificationCode: null, currentHash: null };
  }

  const response = log.responsePayload as {
    verificationCode?: string;
    ack?: { aeat?: { idRegistro?: string; csv?: string; huella?: string } };
  } | null;

  return {
    aeatReference:
      response?.ack?.aeat?.idRegistro?.trim() ||
      response?.ack?.aeat?.csv?.trim() ||
      null,
    verificationCode: response?.verificationCode?.trim() || null,
    currentHash: response?.ack?.aeat?.huella?.trim() || null,
  };
}
