<template>
  <div class="RectanguloForo">
    <header class="forum-header">
      <h1 class="titulo-foro">Foro de la Comunidad</h1>
    </header>

    <main class="forum-content">
      <section class="ListaTemas">
        <div class="titulo-temas">
          <h2 class="Seccion">Temas Recientes</h2>
          <button @click="openNewThreadModal" class="NuevoTema">
            Crear Nuevo Tema
          </button>
        </div>

        <div v-if="loading" class="loading-message">Cargando temas...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="threads.length === 0 && !loading && !error" class="no-threads-message">
          No hay temas en el foro aún. ¡Sé el primero en crear uno!
        </div>

        <ul class="TarjetasTemas">
          <li v-for="thread in threads" :key="thread.id" class="TarjetaIndividual">
            <h3 @click="goToThreadDetail(thread.id)">{{ thread.title }}</h3>
            <p class="InfoAutor">
              Publicado por
              <span class="author-name">{{ thread.author }}</span>
              <span v-if="thread.authorReputation" class="reputacion-icono">({{ thread.authorReputation }} Rep.)</span> el {{ formatDate(thread.date) }}
            </p>
            <p class="thread-description">{{ truncateContent(thread.content, 150) }}</p>
            <div class="thread-stats">
              <span>{{ thread.replies }} Respuestas</span>
            </div>
            <button @click="goToThreadDetail(thread.id)" class="view-thread-button">Ver Tema</button>
          </li>
        </ul>
      </section>
    </main>

    <div v-if="showNewThreadModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Crear Nuevo Tema</h3>
        <form @submit.prevent="createNewThread">
          <div class="form-group">
            <label for="newThreadTitle">Título:</label>
            <input type="text" id="newThreadTitle" v-model="newThread.title" required />
          </div>
          <div class="form-group">
            <label for="newThreadContent">Contenido:</label>
            <textarea id="newThreadContent" v-model="newThread.content" rows="6" required></textarea>
          </div>
          <div class="modal-actions">
            <button type="submit" class="submit-button" :disabled="creatingThread">
              {{ creatingThread ? 'Creando...' : 'Crear' }}
            </button>
            <button type="button" @click="closeNewThreadModal" class="cancel-button">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import router from '@/Router'; // Asegúrate de que esta ruta sea correcta para tu router

export default {
  name: 'ForoUsuarios', // El nombre del componente
  data() {
    return {
      threads: [],
      loading: false,
      error: null,
      showNewThreadModal: false,
      newThread: {
        title: '',
        content: '',
      },
      creatingThread: false,
      // URL base de tu API de Express
      API_BASE_URL: 'http://localhost:4000/api/forum', // El puerto 4000 es el de tu backend Express
    };
  },
  created() {
    this.fetchThreads();
  },
  methods: {
    // Método para obtener el token JWT del almacenamiento (localStorage o sessionStorage)
    getToken() {
      // ESTA ES LA LÍNEA CLAVE QUE DEBES CAMBIAR
      return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    },

    // Método para obtener todos los temas del foro
    async fetchThreads() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(this.API_BASE_URL + '/threads');
        this.threads = response.data;
        console.log('Temas del foro cargados:', this.threads);
      } catch (err) {
        console.error('Error al cargar los temas del foro:', err);
        this.error = 'No se pudieron cargar los temas del foro. Inténtalo de nuevo más tarde.';
        alert('Error al cargar los temas: ' + (err.response?.data?.message || err.message));
      } finally {
        this.loading = false;
      }
    },

    // Método para abrir el modal de creación de nuevo tema
    openNewThreadModal() {
      const token = this.getToken();
      // console.log('Token en openNewThreadModal:', token); // Descomenta para depuración
      if (!token) {
        alert('Debes iniciar sesión para crear un nuevo tema.');
        router.push('/login'); // Redirige a la página de login
        return;
      }
      this.newThread.title = '';
      this.newThread.content = '';
      this.showNewThreadModal = true;
    },

    // Método para cerrar el modal de creación de nuevo tema
    closeNewThreadModal() {
      this.showNewThreadModal = false;
    },

    // Método para crear un nuevo tema
    async createNewThread() {
      this.creatingThread = true;
      try {
        const token = this.getToken();
        // console.log('Token en createNewThread:', token); // Descomenta para depuración
        if (!token) {
          alert('No estás autenticado. Por favor, inicia sesión.');
          router.push('/login');
          return;
        }

        const response = await axios.post(
          this.API_BASE_URL + '/threads',
          this.newThread,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log('Tema creado exitosamente:', response.data.thread);
        alert('Tema creado exitosamente!');
        this.closeNewThreadModal();
        this.fetchThreads(); // Recarga la lista de temas para mostrar el nuevo
      } catch (err) {
        console.error('Error al crear el tema:', err);
        const errorMessage = err.response?.data?.message || 'Error al crear el tema. Inténtalo de nuevo.';
        alert(errorMessage);
      } finally {
        this.creatingThread = false;
      }
    },

    // Método para truncar contenido (útil para la descripción del tema en la lista)
    truncateContent(text, maxLength) {
      if (!text) return '';
      if (text.length > maxLength) {
        return text.substring(0, maxLength) + '...';
      }
      return text;
    },

    // Método para formatear la fecha
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },

    // Método para navegar a la página de detalles de un tema
    goToThreadDetail(threadId) {
      router.push({ name: 'ThreadDetail', params: { id: threadId } });
    },
  },
};
</script>

<style scoped>
/* Colores de referencia:
   - hsl(300, 29%, 78%) se traduce aproximadamente a #d9bad9 (Rosa-morado pastel)
   - #5e1c7d (Morado oscuro principal)
   - Otros tonos de morado y rosa para complementos.
*/

/* Contenedor principal del foro */
.RectanguloForo {
    width: 100%; /* Ocupa el 100% del ancho disponible */
    /* Eliminar height fijo si el contenido debe determinar la altura */
    min-height: 230px; /* Asegura una altura mínima para la cabecera */
    background-color: hsl(0, 0%, 100%); /* Rosa-morado pastel para la cabecera */
    display: flex;
    flex-direction: column; /* Apila el header y el main */
    align-items: center; /* Centra el contenido horizontalmente */
    padding: 0; /* Padding se manejará en los elementos internos */
    margin: 0; /* Elimina márgenes externos */
    font-family: 'Inter', sans-serif; /* Fuente consistente */
    box-sizing: border-box; /* Incluye padding y border en el ancho/alto total */
    position: relative; /* Necesario para posicionar el título si es absoluto */
}

/* Cabecera del foro */
.forum-header {
    width: 100%;
    padding: 60px 20px 40px; /* Más padding para el título */
    background-color: #d9bad9; /* Morado oscuro para la cabecera, más imponente */
    color: white;
    text-align: center;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    margin-bottom: 30px; /* Espacio debajo de la cabecera */
}

.titulo-foro {
    font-size: 3.5rem; /* Título más grande y dominante */
    font-weight: 900; /* Extra Black */
    color: #ffffff; /* Blanco puro */
    margin: 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3); /* Sombra para realzar el texto */
}

/* Contenido principal del foro (debajo de la cabecera) */
.forum-content {
    max-width: 1000px; /* Ancho máximo para el contenido del foro */
    width: 95%; /* Se ajusta a la ventana */
    margin: -80px auto 40px auto; /* Mueve el contenido hacia arriba para superponerse con la cabecera */
    padding: 30px;
    background-color: #ffffff; /* Fondo blanco para el contenido */
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15); /* Sombra más pronunciada */
    position: relative; /* Para el z-index */
    z-index: 100; /* Asegura que esté sobre el RectanguloForo */
}

/* Sección de lista de temas */
.ListaTemas {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

/* Título "Temas Recientes" y botón "Crear Nuevo Tema" */
.titulo-temas {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee; /* Separador sutil */
}

.Seccion {
    font-size: 1.8em;
    font-weight: 700;
    color: #5e1c7d; /* Morado oscuro para los títulos de sección */
    margin: 0;
}

.NuevoTema {
    background-color: #e4a0d5; /* Rosa vibrante */
    color: white;
    padding: 12px 25px;
    border-radius: 8px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
}

.NuevoTema:hover {
    background-color: #d288c0; /* Un poco más oscuro al pasar el ratón */
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.15);
}

/* Mensajes de carga, error y "no hay temas" */
.loading-message, .error-message, .no-threads-message {
    text-align: center;
    padding: 25px;
    font-size: 1.1em;
    border-radius: 10px;
    margin-top: 20px;
    background-color: #f8f0ff; /* Fondo muy claro para mensajes */
   color: white;
    border: 1px solid #d9bad9;
}

.error-message {
    background-color: #ffebeb;
    color: #dc3545;
    border: 1px solid #f5c6cb;
}

.no-threads-message {
    font-style: italic;
    color: #777;
}

/* Lista de tarjetas de temas */
.TarjetasTemas {
    list-style: none; /* Elimina los puntos de la lista */
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 15px; /* Espacio entre las tarjetas de tema */
}

/* Tarjeta de tema individual */
.TarjetaIndividual {
    background-color: #fdfdfd; /* Blanco casi puro para las tarjetas */
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08); /* Sombra suave */
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border: 1px solid #eee; /* Borde sutil */
    display: flex;
    flex-direction: column;
}

.TarjetaIndividual:hover {
    transform: translateY(-5px); /* Efecto de levantamiento al pasar el ratón */
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

.TarjetaIndividual h3 {
    font-size: 1.5em;
    font-weight: 700;
    color: white; /* Morado oscuro para el título del tema */
    margin-bottom: 8px;
    cursor: pointer; /* Indica que el título es clicable */
    transition: color 0.2s ease;
}

.TarjetaIndividual h3:hover {
    color: #8c2aae; /* Morado más claro al pasar el ratón */
    text-decoration: underline;
}

.InfoAutor {
    font-size: 0.9em;
    color: #666;
    margin-bottom: 12px;
}

.author-name {
    font-weight: 600;
    color: #5e1c7d; /* Morado oscuro para el nombre del autor */
}

.reputacion-icono {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 25px; /* Ancho mínimo para números de 1 o 2 dígitos */
    height: 25px;
    border-radius: 50%;
    background-color: #fcd34d; /* Amarillo para reputación */
    color: #92400e; /* Marrón oscuro para el texto */
    font-weight: bold;
    font-size: 0.8em;
    margin-left: 8px;
    padding: 0 5px; /* Pequeño padding horizontal */
}

.thread-description {
    font-size: 1em;
    color: #444;
    line-height: 1.6;
    margin-bottom: 15px;
}

.thread-stats {
    font-size: 0.9em;
    color: #777;
    margin-top: auto; /* Empuja las estadísticas hacia abajo */
    text-align: right;
    padding-top: 10px;
    border-top: 1px dashed #eee; /* Separador para las estadísticas */
}

.view-thread-button {
    background-color: #d9bad9; /* Rosa-morado pastel para el botón de ver */
    color: white; /* Texto morado oscuro */
    padding: 8px 18px;
    border-radius: 6px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    align-self: flex-end; /* Alinea el botón a la derecha */
    margin-top: 15px;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.view-thread-button:hover {
    background-color: #c0a0c0; /* Un poco más oscuro al pasar el ratón */
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Estilos para el modal (overlay y contenido) */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 3000; /* Asegura que esté por encima de todo */
    backdrop-filter: blur(5px);
    animation: fadeIn 0.3s ease-out forwards;
}

.modal-content {
    background-color: white;
    padding: 35px;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    max-width: 600px;
    width: 90%;
    position: relative;
    animation: slideInFromTop 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.modal-content h3 {
    font-size: 2em;
    color: #5e1c7d;
    margin-bottom: 25px;
    text-align: center;
    font-weight: 700;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    font-size: 1.05em;
    color: #333;
    margin-bottom: 8px;
    font-weight: 600;
}

.form-group input[type="text"],
.form-group textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ccc;
    border-radius: 8px;
    font-size: 1em;
    box-sizing: border-box; /* Asegura que padding no aumente el ancho */
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #e4a0d5; /* Color de foco rosa */
    box-shadow: 0 0 0 3px rgba(228, 160, 213, 0.3);
}

.form-group textarea {
    resize: vertical; /* Permite redimensionar verticalmente */
    min-height: 120px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 25px;
}

.submit-button, .cancel-button {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1em;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.1s ease;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.submit-button {
    background-color: #d9bad9; /* Morado oscuro para acción principal */
    color: white;
}

.submit-button:hover:not(:disabled) {
    background-color: #4a1766; /* Morado más oscuro al pasar el ratón */
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.2);
}

.submit-button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    box-shadow: none;
}

.cancel-button {
    background-color: #e0e0e0; /* Gris claro para cancelar */
    color: #555;
}

.cancel-button:hover {
    background-color: #c0c0c0; /* Gris más oscuro al pasar el ratón */
    transform: translateY(-2px);
    box-shadow: 0 5px 12px rgba(0, 0, 0, 0.1);
}

/* Animaciones (reutilizadas del componente anterior) */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideInFromTop {
    from {
        opacity: 0;
        transform: translateY(-50px) scale(0.95);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Media Queries para responsividad */
@media (max-width: 768px) {
    .forum-header {
        padding: 40px 15px 30px;
    }
    .titulo-foro {
        font-size: 2.5rem;
    }
    .forum-content {
        width: 98%;
        padding: 20px;
        margin: -60px auto 30px auto;
    }
    .titulo-temas {
        flex-direction: column; /* Apila el título y el botón */
        align-items: flex-start;
        gap: 15px;
    }
    .NuevoTema {
        width: 100%; /* Botón ocupa todo el ancho */
        text-align: center;
    }
    .Seccion {
        font-size: 1.5em;
    }
    .TarjetaIndividual {
        padding: 15px;
    }
    .TarjetaIndividual h3 {
        font-size: 1.3em;
    }
    .modal-content {
        width: 95%;
        padding: 25px;
    }
    .modal-content h3 {
        font-size: 1.7em;
    }
}

@media (max-width: 480px) {
    .forum-header {
        padding: 30px 10px 20px;
    }
    .titulo-foro {
        font-size: 2rem;
    }
    .forum-content {
        padding: 15px;
        margin: -50px auto 20px auto;
    }
    .Seccion {
        font-size: 1.3em;
    }
    .TarjetaIndividual h3 {
        font-size: 1.1em;
    }
    .InfoAutor, .thread-description, .thread-stats {
        font-size: 0.85em;
    }
    .view-thread-button {
        padding: 7px 15px;
        font-size: 0.9em;
    }
    .modal-content {
        padding: 20px;
    }
    .modal-actions {
        flex-direction: column;
        gap: 10px;
    }
    .submit-button, .cancel-button {
        width: 100%;
        text-align: center;
    }
}
</style>