const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmail(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) {
    return 'Ingresa tu correo electrónico.';
  }
  if (!EMAIL_REGEX.test(email)) {
    return 'Ingresa un correo electrónico válido (ejemplo: estudiante@gmail.com).';
  }
  return null;
}

export function mapAuthError(message: string): string {
  const msg = message.toLowerCase();

  if (msg.includes('invalid login credentials')) {
    return 'Correo electrónico o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.';
  }
  if (msg.includes('user already registered') || msg.includes('already been registered')) {
    return 'Este correo electrónico ya está registrado. Intenta iniciar sesión o recuperar tu contraseña.';
  }
  if (msg.includes('password should be at least')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (msg.includes('new password should be different')) {
    return 'Tu nueva contraseña debe ser diferente a la contraseña actual.';
  }
  if (msg.includes('email not confirmed')) {
    return 'Tu cuenta aún no está confirmada. Revisa tu bandeja de entrada o spam para confirmar tu correo.';
  }
  if (
    msg.includes('over_email_send_rate_limit') ||
    msg.includes('email rate limit') ||
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('for security purposes')
  ) {
    return 'Se alcanzó temporalmente el límite de envíos de correo por hora de Supabase. Espera unos minutos antes de volver a intentarlo.';
  }
  if (msg.includes('invalid') && (msg.includes('token') || msg.includes('otp') || msg.includes('expired'))) {
    return 'El enlace de recuperación expiró o ya fue utilizado. Solicita uno nuevo desde "¿Olvidaste tu contraseña?".';
  }
  if (msg.includes('network') || msg.includes('failed to fetch')) {
    return 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  }

  return message || 'Ocurrió un error inesperado al autenticar.';
}
