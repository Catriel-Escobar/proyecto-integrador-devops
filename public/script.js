const API_URL = '/api/comentarios';

const comentarioForm = document.getElementById('comentarioForm');
const nombreInput = document.getElementById('nombre');
const mensajeInput = document.getElementById('mensaje');
const comentariosContainer = document.getElementById('comentariosContainer');

document.addEventListener('DOMContentLoaded', () => {
  cargarComentarios();
});

comentarioForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = nombreInput.value.trim() || 'Anónimo';
  const mensaje = mensajeInput.value.trim();

  if (!mensaje) {
    alert('Por favor, escribe un mensaje');
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre, mensaje }),
    });

    if (response.ok) {
      nombreInput.value = '';
      mensajeInput.value = '';

      cargarComentarios();
    } else {
      const error = await response.json();
      alert('Error: ' + error.error);
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al enviar el comentario. Intenta de nuevo.');
  }
});

async function cargarComentarios() {
  comentariosContainer.innerHTML =
    '<p class="loading">Cargando comentarios...</p>';

  try {
    const response = await fetch(API_URL);
    const comentarios = await response.json();

    if (comentarios.length === 0) {
      comentariosContainer.innerHTML =
        '<p class="empty">No hay comentarios aún. ¡Sé el primero en comentar!</p>';
      return;
    }

    comentariosContainer.innerHTML = comentarios
      .map((comentario) => crearComentarioHTML(comentario))
      .join('');
  } catch (error) {
    console.error('Error:', error);
    comentariosContainer.innerHTML =
      '<p class="empty">Error al cargar comentarios. Intenta recargar la página.</p>';
  }
}

function crearComentarioHTML(comentario) {
  const fecha = new Date(comentario.fecha);
  const fechaFormateada = fecha.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
        <div class="comentario">
            <div class="comentario-header">
                <span class="comentario-nombre">${escaparHTML(
                  comentario.nombre
                )}</span>
                <span class="comentario-fecha">${fechaFormateada}</span>
            </div>
            <div class="comentario-mensaje">${escaparHTML(
              comentario.mensaje
            )}</div>
        </div>
    `;
}

function escaparHTML(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}
