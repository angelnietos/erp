export interface JosanzFigmaCreateField {
  label: string;
  placeholder: string;
  controlName: string;
  type?: 'text' | 'date';
}

export interface JosanzFigmaCreateSection {
  title: string;
  fields: JosanzFigmaCreateField[];
  columns?: 1 | 2;
}

export interface JosanzFigmaCreateConfig {
  title: string;
  saveLabel: string;
  listRoute: string;
  sections: JosanzFigmaCreateSection[];
}

export const FIGMA_CREATE_EQUIPMENT: JosanzFigmaCreateConfig = {
  title: 'Nuevo equipo',
  saveLabel: 'Crear equipo',
  listRoute: '/equipment',
  sections: [
    {
      title: 'Identificación',
      fields: [
        { label: 'Nombre del equipo', placeholder: 'Micrófono 01', controlName: 'nombre' },
        { label: 'Número de serie', placeholder: 'SN-000000', controlName: 'serie' },
        { label: 'Categoría', placeholder: 'Sonido', controlName: 'categoria' },
        { label: 'Marca / modelo', placeholder: 'Marca ejemplo', controlName: 'marca' },
      ],
      columns: 2,
    },
    {
      title: 'Ubicación',
      fields: [
        { label: 'Almacén', placeholder: 'Almacén 01', controlName: 'almacen' },
        { label: 'Ubicación en rack', placeholder: 'Rack A-12', controlName: 'ubicacion' },
      ],
      columns: 2,
    },
  ],
};

export const FIGMA_CREATE_VEHICLE: JosanzFigmaCreateConfig = {
  title: 'Nuevo vehículo',
  saveLabel: 'Crear vehículo',
  listRoute: '/vehicles',
  sections: [
    {
      title: 'Datos del vehículo',
      fields: [
        { label: 'Modelo', placeholder: 'Mercedes Sprinter', controlName: 'modelo' },
        { label: 'Matrícula', placeholder: '1234 ABC', controlName: 'matricula' },
        { label: 'Base / almacén', placeholder: 'Almacén 01', controlName: 'base' },
        { label: 'Responsable', placeholder: 'Nombre responsable', controlName: 'responsable' },
      ],
      columns: 2,
    },
    {
      title: 'Documentación',
      fields: [
        { label: 'Próxima ITV', placeholder: 'dd/mm/aaaa', controlName: 'itv', type: 'date' },
        { label: 'Seguro (vencimiento)', placeholder: 'dd/mm/aaaa', controlName: 'seguro', type: 'date' },
      ],
      columns: 2,
    },
  ],
};

export const FIGMA_CREATE_STAFF: JosanzFigmaCreateConfig = {
  title: 'Nuevo personal',
  saveLabel: 'Añadir personal',
  listRoute: '/staff',
  sections: [
    {
      title: 'Datos personales',
      fields: [
        { label: 'Nombre y apellidos', placeholder: 'Nombre Apellidos', controlName: 'nombre' },
        { label: 'Email', placeholder: 'email@ejemplo.com', controlName: 'email' },
        { label: 'Teléfono', placeholder: '600 000 000', controlName: 'telefono' },
        { label: 'Perfil / especialidad', placeholder: 'Técnico sonido', controlName: 'perfil' },
      ],
      columns: 2,
    },
    {
      title: 'Contrato',
      fields: [
        { label: 'Tipo de contrato', placeholder: 'Indefinido / Freelance', controlName: 'contrato' },
        { label: 'Fecha de alta', placeholder: 'dd/mm/aaaa', controlName: 'alta', type: 'date' },
      ],
      columns: 2,
    },
  ],
};

export const FIGMA_CREATE_BILLING: JosanzFigmaCreateConfig = {
  title: 'Nueva factura',
  saveLabel: 'Crear factura',
  listRoute: '/billing',
  sections: [
    {
      title: 'Datos de facturación',
      fields: [
        { label: 'Cliente', placeholder: 'Cliente ejemplo S.L.', controlName: 'cliente' },
        { label: 'Nº documento', placeholder: 'FAC-2026-XXX', controlName: 'numero' },
        { label: 'Fecha emisión', placeholder: 'dd/mm/aaaa', controlName: 'fecha', type: 'date' },
        { label: 'Importe base', placeholder: '0,00 €', controlName: 'importe' },
      ],
      columns: 2,
    },
  ],
};
