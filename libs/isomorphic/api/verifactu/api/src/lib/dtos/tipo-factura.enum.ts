/**
 * Tipos de factura según la AEAT
 * Invoice types according to AEAT
 */
export enum TipoFactura {
  /** Factura (art. 4, 6 y 7 RD 1619/2012) */
  F1 = 'F1',
  /** Factura simplificada (art. 4, 6 y 7 RD 1619/2012) - Factura simplificada y factura */
  F2 = 'F2',
  /** Factura emitida en sustitución de facturas simplificadas facturadas con anterioridad */
  F3 = 'F3',
  /** Asiento resumen: documento que se expide por el destinatario en facturas recibidas */
  F4 = 'F4',
  /** Importe de la factura en documento sustitutivo */
  F5 = 'F5',
  /** Factura electrónica */
  F6 = 'F6',
}

/**
 * Claves de régimen según la AEAT
 * Tax scheme keys according to AEAT
 */
export enum ClaveRegimen {
  /** Régimen General */
  RegimenGeneral = '01',
  /** Exportación */
  Exportacion = '02',
  /** Operaciones a las que se aplique el régimen especial de las agencias de viajes */
  AgenciasViajes = '03',
  /** Operaciones a las que se aplique el régimen especial de los objetos usados */
  ObjetosUsados = '04',
  /** Operaciones a las que se aplique el régimen especial de objetos de arte */
  ObjetosArte = '05',
  /** Operaciones a las que se aplique el régimen especial de bienes usados */
  BienesUsados = '06',
  /** Régimen especial del criterio de caja */
  CriterioCaja = '07',
  /** Operaciones sujetas al IPSI/IGIC que no devengan IVA */
  IPSI_IGIC = '08',
  /** Facturación de las prestaciones de servicios de agencias de viajes */
  ServiciosAgenciasViajes = '09',
  /** Cobranza de facturas por cuenta de terceros */
  CobranzaTerceros = '10',
  /** Servicios de abogados y procuradores */
  AbogadosProcuradores = '11',
  /** Operaciones de arrendamiento de local de negocio */
  ArrendamientoLocal = '12',
  /** Operaciones de arrendamiento de local de negocio sujetas a retención */
  ArrendamientoLocalRetencion = '13',
  /** Factura correspondiente a una importación */
  Importacion = '14',
  /** Operaciones no sujetas o no sujetas por reglas de localización */
  NoSujeta = '15',
}

/**
 * Calificación de la operación según la AEAT
 * Operation qualification according to AEAT
 */
export enum CalificacionOperacion {
  /** Sujeta - No exenta - Con inversión del sujeto pasivo */
  S1 = 'S1',
  /** Sujeta - No exenta - Sin inversión del sujeto pasivo */
  S2 = 'S2',
  /** Sujeta - Exenta - Art. 20 LIVA */
  S3 = 'S3',
  /** Sujeta - Exenta - Art. 21 LIVA (Exportación) */
  S4 = 'S4',
  /** Sujeta - Exenta - Art. 22 LIVA (Operaciones asimiladas a las exportaciones) */
  S5 = 'S5',
  /** Sujeta - Exenta - Art. 23 y 24 LIVA (Operaciones realizadas en el ámbito espacial del impuesto) */
  S6 = 'S6',
  /** Sujeta - Exenta - Art. 25 LIVA (Entregas de bienes destinados a otro Estado miembro) */
  S7 = 'S7',
  /** No sujeta por reglas de localización - Art. 69, 70 y 72 LIVA */
  N1 = 'N1',
  /** No sujeta - Art. 7, 14, otros de la LIVA */
  N2 = 'N2',
}

/**
 * Tipo de identificador fiscal
 * Tax ID type
 */
export enum TipoIdFiscal {
  /** NIF (España) */
  NIF = 'N',
  /** NIF-IVA (Identificación a efectos del IVA) */
  NIF_IVA = 'V',
  /** Pasaporte */
  Pasaporte = 'P',
  /** Documento oficial de identificación */
  DocOficial = 'X',
  /** Certificado de residencia */
  CertResidencia = 'C',
  /** Otro documento probatorio */
  Otro = 'O',
}

/**
 * Tipo de rectificativa
 * Rectification type
 */
export enum TipoRectificativa {
  /** Por sustitución */
  Sustitucion = 'S',
  /** Por diferencias */
  Diferencias = 'I',
}

/**
 * Motivo de anulación
 * Cancellation reason
 */
export enum MotivoAnulacion {
  /** Factura incorrecta */
  FacturaIncorrecta = '01',
  /** Devolución de bienes o servicios */
  Devolucion = '02',
  /** Otros motivos */
  Otros = '03',
}

/**
 * Tipo de impuesto según la AEAT
 * Tax type according to AEAT
 */
export enum Impuesto {
  /** IVA - Impuesto sobre el Valor Añadido */
  IVA = '01',
  /** IPSI - Impuesto sobre la Producción, los Servicios y la Importación */
  IPSI = '02',
  /** IGIC - Impuesto General Indirecto Canario */
  IGIC = '03',
  /** Otros impuestos */
  Otros = '04',
}

/**
 * Estado de la factura
 * Invoice status
 */
export enum InvoiceStatus {
  /** Pendiente de envío a AEAT */
  PENDIENTE_ENVIO = 'PendienteEnvio',
  /** Enviada a AEAT, esperando confirmación */
  ENVIADA = 'Enviada',
  /** Confirmada por AEAT */
  CONFIRMADA = 'Confirmada',
  /** Rechazada por AEAT */
  RECHAZADA = 'Rechazada',
  /** Anulada */
  ANULADA = 'Anulada',
  /** Error en el envío */
  ERROR = 'Error',
}
