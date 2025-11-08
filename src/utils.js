export function normalizarNombre(nombre) {
  if (!nombre || typeof nombre !== 'string') {
    return 'Anónimo';
  }
  const nombreTrimmed = nombre.trim();
  return nombreTrimmed.length > 0 ? nombreTrimmed : 'Anónimo';
}

export function validarMensaje(mensaje) {
  if (!mensaje) {
    return { valido: false, error: 'El mensaje es requerido' };
  }

  if (typeof mensaje !== 'string') {
    return { valido: false, error: 'El mensaje debe ser un texto' };
  }

  if (mensaje.trim().length === 0) {
    return { valido: false, error: 'El mensaje no puede estar vacío' };
  }

  return { valido: true };
}

export function crearComentario(nombre, mensaje) {
  const nombreFinal = normalizarNombre(nombre);
  const validacion = validarMensaje(mensaje);

  if (!validacion.valido) {
    throw new Error(validacion.error);
  }

  return {
    nombre: nombreFinal,
    mensaje: mensaje.trim(),
    fecha: new Date(),
  };
}
