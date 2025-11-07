const {
  normalizarNombre,
  validarMensaje,
  crearComentario,
} = require('../src/utils');

describe('Utilidades de Comentarios', () => {
  describe('normalizarNombre', () => {
    test('debe retornar "Anónimo" cuando el nombre es null', () => {
      expect(normalizarNombre(null)).toBe('Anónimo');
    });

    test('debe retornar "Anónimo" cuando el nombre es undefined', () => {
      expect(normalizarNombre(undefined)).toBe('Anónimo');
    });

    test('debe retornar "Anónimo" cuando el nombre está vacío', () => {
      expect(normalizarNombre('')).toBe('Anónimo');
      expect(normalizarNombre('   ')).toBe('Anónimo');
    });

    test('debe retornar el nombre normalizado cuando es válido', () => {
      expect(normalizarNombre('Juan')).toBe('Juan');
      expect(normalizarNombre('  María  ')).toBe('María');
    });
  });

  describe('validarMensaje', () => {
    test('debe retornar error cuando el mensaje es null', () => {
      const resultado = validarMensaje(null);
      expect(resultado.valido).toBe(false);
      expect(resultado.error).toBe('El mensaje es requerido');
    });

    test('debe retornar error cuando el mensaje está vacío', () => {
      const resultado = validarMensaje('   ');
      expect(resultado.valido).toBe(false);
      expect(resultado.error).toBe('El mensaje no puede estar vacío');
    });

    test('debe retornar válido cuando el mensaje es correcto', () => {
      const resultado = validarMensaje('Este es un mensaje válido');
      expect(resultado.valido).toBe(true);
      expect(resultado.error).toBeUndefined();
    });
  });

  describe('crearComentario', () => {
    test('debe crear un comentario con nombre anónimo cuando no se proporciona nombre', () => {
      const comentario = crearComentario(null, 'Mensaje de prueba');
      expect(comentario.nombre).toBe('Anónimo');
      expect(comentario.mensaje).toBe('Mensaje de prueba');
      expect(comentario.fecha).toBeInstanceOf(Date);
    });

    test('debe lanzar error cuando el mensaje es inválido', () => {
      expect(() => {
        crearComentario('Juan', '');
      }).toThrow('El mensaje es requerido');
    });
  });
});
