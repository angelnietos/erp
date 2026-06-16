/**
 * Resuelve instrucciones de workflow conocidas sin llamar a un LLM.
 * Garantiza demos y delegaciones cuando no hay API key o el proveedor falla.
 */
export function resolveOfflineWorkflowResponse(
  prompt: string,
  context?: string,
): string | null {
  const blob = `${prompt}\n${context ?? ''}`.toLowerCase();

  const isWorkflowInstruction =
    blob.includes('instrucción automática') ||
    blob.includes('instrucción de workflow') ||
    blob.includes('instrucción del orquestador') ||
    blob.includes('ejecuta esta tarea');

  if (!isWorkflowInstruction) {
    return null;
  }

  if (
    (blob.includes('presupuesto') ||
      blob.includes('borrador') ||
      blob.includes('oferta') ||
      blob.includes('compra')) &&
    (blob.includes('altavoz') ||
      blob.includes('reposición') ||
      blob.includes('stock') ||
      blob.includes('audiovisuales'))
  ) {
    return (
      'Preparo el borrador de reposición en Presupuestos con los datos del proveedor.\n\n' +
      `[ACTION] [{"type":"navigate","payload":{"url":"/budgets/new"}},{"type":"wait","payload":{"ms":700}},` +
      `{"type":"fillBudget","payload":{"client":"Audiovisuales Madrid","items":[{"name":"Altavoz Autoamplificado","qty":10,"price":0}],"notes":"Reposición automática (modo demo)"}},` +
      `{"type":"notify","payload":{"message":"Borrador de compra preparado en Presupuestos","variant":"success"}}]`
    );
  }

  if (
    (blob.includes('oferta') || blob.includes('presupuesto')) &&
    (blob.includes('proyector') || blob.includes('eventos global'))
  ) {
    return (
      'Abro la ficha del cliente y preparo la oferta de alquiler.\n\n' +
      `[ACTION] [{"type":"navigateAndFilter","payload":{"url":"/clients","query":"Eventos Global"}},{"type":"wait","payload":{"ms":600}},` +
      `{"type":"navigate","payload":{"url":"/budgets/new"}},{"type":"wait","payload":{"ms":600}},` +
      `{"type":"fillBudget","payload":{"client":"Eventos Global S.L.","items":[{"name":"Proyector Láser 4K","qty":4,"price":0}],"notes":"Oferta de alquiler (modo demo)"}},` +
      `{"type":"notify","payload":{"message":"Oferta comercial en preparación","variant":"success"}}]`
    );
  }

  if (
    blob.includes('técnico') &&
    (blob.includes('audio') || blob.includes('sustitu') || blob.includes('dani'))
  ) {
    return (
      'Busco técnicos con habilidad AUDIO disponibles para la sustitución.\n\n' +
      `[ACTION] [{"type":"applyFilter","payload":{"query":"AUDIO"}},{"type":"notify","payload":{"message":"Filtrando técnicos con habilidad AUDIO","variant":"success"}}]`
    );
  }

  if (blob.includes('stock') && (blob.includes('0') || blob.includes('crítico'))) {
    return (
      'Reviso el inventario con stock crítico.\n\n' +
      `[ACTION] [{"type":"navigateAndFilter","payload":{"url":"/inventory","query":"stock 0"}},{"type":"notify","payload":{"message":"Filtro de stock crítico aplicado","variant":"info"}}]`
    );
  }

  if (blob.includes('inventario') && blob.includes('filtr')) {
    return (
      'Aplico el filtro solicitado en inventario.\n\n' +
      `[ACTION] [{"type":"navigateAndFilter","payload":{"url":"/inventory","query":"stock 0"}},{"type":"notify","payload":{"message":"Inventario filtrado","variant":"info"}}]`
    );
  }

  if (blob.includes('baja') || blob.includes('sick_leave') || blob.includes('disponibilidad')) {
    return (
      'Registro la baja y reviso el calendario del equipo.\n\n' +
      `[ACTION] [{"type":"navigate","payload":{"url":"/availability"}},{"type":"wait","payload":{"ms":500}},` +
      `{"type":"notify","payload":{"message":"Calendario de disponibilidad abierto — confirma fechas en el módulo","variant":"info"}}]`
    );
  }

  if (blob.includes('evento') || blob.includes('concierto')) {
    return (
      'Abro el evento indicado para revisar asignaciones.\n\n' +
      `[ACTION] [{"type":"navigateAndFilter","payload":{"url":"/events","query":"Concierto Verano 2026"}},{"type":"notify","payload":{"message":"Evento localizado en el calendario","variant":"success"}}]`
    );
  }

  // Respuesta genérica con acción mínima para que el usuario vea progreso
  return (
    'Entendido. Ejecuto la tarea en tu módulo actual con el motor de orquestación local.\n\n' +
    `[ACTION] [{"type":"notify","payload":{"message":"Tarea procesada en modo demo (sin API de IA)","variant":"info"}}]`
  );
}
