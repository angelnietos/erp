# Guía de Mejoras UI/UX - JOSANZ ERP

## Objetivo

Mejorar consistencia, visibilidad, jerarquía visual y eliminar "gigantismo" en todos los componentes y features del browser.

---

## Principios de Diseño

### 1. Tipografía

- **Títulos de página**: 1.5rem - 1.75rem, font-weight 700 (no 900)
- **Títulos de sección**: 1rem - 1.25rem, font-weight 600
- **Etiquetas (labels)**: 0.75rem - 0.8rem, font-weight 600, letter-spacing 0.05em
- **Cuerpo**: 0.85rem - 0.9rem, font-weight 400
- **NO usar mayúsculas masivas** - solo en breadcrumbs técnicos o labels pequeños
- **Contraste WCAG AA** mínimo 4.5:1 para texto normal

### 2. Espaciado

- **Padding de cards**: 1rem - 1.25rem (no 0.5rem)
- **Gap entre elementos**: 0.75rem - 1rem
- **Margen entre secciones**: 1.5rem - 2rem
- **Border-radius**: 8px - 12px (suave, no extremo)

### 3. Visibilidad

- **Botones**: mínimo size "md" (padding 0.55rem 1.15rem)
- **Iconos en acciones**: mínimo 18px, mejor 20px
- **Estados vacíos**: icon 48px + texto claro + padding adecuado
- **Badges**: padding 0.25rem 0.5rem, font-size 0.7rem

### 4. Eliminar Gigantismo Visual

- Quitar glows excesivos
- Quitar text-shadow innecesarios
- Quitar animaciones sobreanimadas
- Usar tokens CSS, no valores hardcodeados
- Simplificar estados hover

### 5. Acciones

- Todo botón debe tener handler o feedback
- Confirmaciones con modal/toast, no `confirm()`
- Loading states visibles

---

## Orden de Trabajo

1. **UI-Kit Base** - Estandarizar componentes
2. **Clientes** - Feature piloto
3. **Replicar a otras features** - Usar clientes como模板

---

## Checklist Mejora - Componentes UI-Kit

| Componente | Estado Actual            | Mejora Necesaria             |
| ---------- | ------------------------ | ---------------------------- |
| Card       | ⚠️ Bien, revisar padding | Normalizar sizes             |
| Button     | ✅ Bien                  | Consistency                  |
| Input      | ⚠️ revisar labels        | Tamaño mínimo, labels claros |
| Table      | ⚠️ revisar densidad      | Espaciado adecuado           |
| Badge      | ⚠️ muy pequeño           | Aumentar legibilidad         |
| Modal      | ✅ bien                  | -                            |
| Tabs       | ✅ bien                  | -                            |
| StatCard   | ⚠️ revisar valores       | Números más visibles         |
| Search     | ✅ bien                  | -                            |

---

## Checklist Mejora - Clientes

### Clients List (✅ Completado)

- [x] Header: reducir glow, fonts más normales
- [x] Stats row: números más visibles
- [x] Search: placeholder más claro
- [x] Tabla: spacing adecuado, botones acción con titles
- [x] Modal form: labels más legibles
- [x] Eliminar uppercase masivo

### Clients Detail (✅ Completado)

- [x] Breadcrumb: font-size adecuado (0.8rem)
- [x] Título cliente: más visible, sin glow
- [x] Stats: números destacados
- [x] Tabs: más legibles
- [x] Info items: labels más claros (0.75rem), values más grandes (0.9rem)
- [x] Documentos: mejor spacing, clases CSS en vez de estilos inline
- [x] Estados vacíos: icon 48px, texto claro

### StatCard UI-Kit (✅ Completado)

- [x] Valor: font-size 1.75rem, font-weight 700 (antes clamp con 900)

---

## Tokens CSS a Usar

```css
/* Tamaño base */
--font-xs: 0.7rem;
--font-sm: 0.8rem;
--font-base: 0.9rem;
--font-lg: 1rem;
--font-xl: 1.25rem;
--font-2xl: 1.5rem;

/* Espaciado */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;

/* Border radius */
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
```

---

## Notas

- Usar siempre tokens CSS del ThemeService
- Priorizar legibilidad sobre efectos visuales
- Mobile-first: revisar en pantallas pequeñas
- High performance mode debe funcionar bien
