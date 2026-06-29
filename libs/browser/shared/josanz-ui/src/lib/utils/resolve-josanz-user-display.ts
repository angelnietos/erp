/** Usuario mínimo para etiquetas en shell Figma (GlobalAuthStore). */
export type JosanzSessionUserLike = {
  name?: string | null;
  email?: string | null;
};

/** Nombre visible en cabeceras Figma; cae a email local-part si no hay nombre. */
export function resolveJosanzUserDisplayName(
  user: JosanzSessionUserLike | null | undefined,
): string {
  const name = user?.name?.trim();
  if (name) {
    return name;
  }
  const email = user?.email?.trim();
  if (email) {
    const local = email.split('@')[0]?.trim();
    if (local) {
      return local;
    }
  }
  return 'Usuario';
}

/** Primer nombre para el título del inicio Figma. */
export function resolveJosanzUserFirstName(
  user: JosanzSessionUserLike | null | undefined,
): string {
  const display = resolveJosanzUserDisplayName(user);
  return display.split(/\s+/)[0] ?? display;
}

/** Saludo del inicio Figma — usa el primer token del nombre. */
export function resolveJosanzWelcomeTitle(
  user: JosanzSessionUserLike | null | undefined,
): string {
  const display = resolveJosanzUserDisplayName(user);
  const first = display.split(/\s+/)[0] ?? display;
  return `Bienvenido/a ${first}`;
}
