const meta = {
  title: 'UI Kit / Kitchen Sink',
  tags: ['autodocs'],
  decorators: [
    (storyFn) => ({
      standalone: true,
      imports: [],
      template: '<div style="padding: 2rem; background: var(--bg-primary); min-height: 100vh;">' + storyFn() + '</div>',
    }),
  ],
};

const columns = [
  { key: 'id', header: 'ID', width: '60px' },
  { key: 'cliente', header: 'Cliente' },
  { key: 'monto', header: 'Monto' },
  { key: 'fecha', header: 'Fecha' },
  { key: 'status', header: 'Estado' },
];

const tableData = [
  { id: 1, cliente: 'Juan Pérez', monto: '1,250.00', fecha: '2024-01-15', status: 'Completado' },
  { id: 2, cliente: 'María García', monto: '890.50', fecha: '2024-01-14', status: 'Pendiente' },
  { id: 3, cliente: 'Carlos López', monto: '2,100.00', fecha: '2024-01-13', status: 'Completado' },
  { id: 4, cliente: 'Ana Martínez', monto: '450.00', fecha: '2024-01-12', status: 'Cancelado' },
  { id: 5, cliente: 'Luis Sánchez', monto: '3,200.00', fecha: '2024-01-11', status: 'Completado' },
];