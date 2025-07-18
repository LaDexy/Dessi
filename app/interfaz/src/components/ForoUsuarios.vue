<template>
  <div class="RectanguloForo"> <header class="forum-header"> <h1 class="titulo-foro">Foro de la Comunidad</h1> </header>

    <main class="forum-content"> <section class="ListaTemas"> <div class="titulo-temas"> <h2 class="Seccion">Temas Recientes</h2> <button @click="openNewThreadModal" class="NuevoTema"> Crear Nuevo Tema
          </button>
        </div>

        <div v-if="loading" class="loading-message">Cargando temas...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="threads.length === 0 && !loading && !error" class="no-threads-message">
          No hay temas en el foro aún. ¡Sé el primero en crear uno!
        </div>

        <ul class="TarjetasTemas"> <li v-for="thread in threads" :key="thread.id" class="TarjetaIndividual"> <h3 @click="goToThreadDetail(thread.id)">{{ thread.title }}</h3>
            <p class="InfoAutor"> Publicado por
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
    // Método para obtener el token JWT del localStorage
    getToken() {
      return localStorage.getItem('userToken');
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
      // Asume que tienes una ruta configurada en tu Vue Router
      // por ejemplo: { path: '/foro/:id', name: 'ThreadDetail', component: ThreadDetailComponent }
      router.push({ name: 'ThreadDetail', params: { id: threadId } });
    },
  },
};
</script>

<style>

/*Rectangulo de barra superior*/

.RectanguloForo {

  width: 1525px;
  height: 230px;
  background-color: hsl(300, 29%, 78%);
   display: flex;
  flex-wrap: wrap;
  justify-content: center; 
  gap: 20px; 
  padding: 20px;
  margin-left: 0%;
}

/* Contenedor principal del foro */
        .forum-container {
            max-width: 960px;
            margin: 2rem auto; 
            padding: 1.5rem;
            background-color: #ffffff;
            border-radius: 0.75rem; 
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
        }

        /* Estilos para el título principal del foro */
        .titulo-foro {
            top: 90px;
            position: absolute;
            font-size: 3rem; 
            font-weight: bold;
            color: #ffffff; 
            margin-bottom: 1.5rem; 
            text-align: center; 
        }

        /* Contenedor de la lista de temas */
        .ListaTemas {
            display: flex;
            flex-direction: column;
            gap: 1rem; 
            margin-bottom: 1.5rem;
        }

        /* Contenedor del título "Temas Recientes" y el botón "Crear Nuevo Tema" */
        .titulo-temas {
            display: flex;
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 1rem; 
        }

        /* Estilos para el h2 "Temas Recientes" */
        .Seccion {
            font-size: 1.5rem;
            font-weight: 600;
            color: #4a5568; 
        }

        /* Estilos para el botón "Crear Nuevo Tema" */
        .NuevoTema {
            background-color: #e4a0d5;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none; 
            cursor: pointer;
            transition: background-color 0.2s ease-in-out; 
        }

        .NuevoTema:hover {
            background-color: #e4a0d5; 
        }

        /* Contenedor donde se cargarán las tarjetas de los temas */
        .TarjetasTemas {
            display: flex;
            flex-direction: column;
            gap: 1rem; 
        }

        /* Estilos para cada tarjeta de tema individual */
        .TarjetaIndividual {
            background-color: #ffffff;
            padding: 1.25rem;
            border-radius: 0.5rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
            cursor: pointer;
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
            display: flex;
            flex-direction: column;
            align-items: flex-start; 
        }

        .TarjetaIndividual:hover {
            transform: translateY(-3px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .TarjetaIndividual h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333333;
            margin-bottom: 0.25rem;
        }

        .TarjetaIndividual p {
            font-size: 0.875rem;
            color: #666666;
            margin-bottom: 0.5rem;
        }

        .InfoAdicional {
            display: flex;
            justify-content: space-between;
            width: 100%;
            font-size: 0.8rem;
            color: #777777;
        }

        /* Estilos para el icono de reputación (círculo amarillo con número) */
        .reputacion-icono {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 50%;
            background-color: #fcd34d; 
            color: #92400e; 
            font-weight: bold;
            font-size: 0.75rem;
            margin-left: 0.5rem;
        }

        /* --- Estilos para la vista de detalle del tema --- */
        .DetalleTemas {
            background-color: #f9fafb; 
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            gap: 1rem; 
        }
        .VolverBoton { /* Botón para volver al foro */
            background-color: #e5e7eb;
            color: #4b5563;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            margin-bottom: 1rem; 
            align-self: flex-start; 
        }
        .VolverBoton:hover {
            background-color: #d1d5db;
        }
        .PrimerTema { /* Tarjeta del tema principal en el detalle */
            background-color: #e0f2fe; 
            border: 1px solid #90cdf4;
            border-radius: 0.5rem;
            padding: 1.5rem;
            margin-bottom: 1rem; 
        }
        .PrimerTema h3 {
            font-size: 1.75rem;
            font-weight: bold;
            color: #2b6cb0;
            margin-bottom: 0.5rem;
        }
        .InfoAutor { /* Información del autor del tema principal */
            font-size: 0.9rem;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .contenido-tema { /* Contenido del tema principal */
            font-size: 1rem;
            line-height: 1.6;
            color: #2d3748;
        }
        .Respuestas { /* Título de la sección de respuestas */
            font-size: 1.25rem;
            font-weight: 600;
            color: #4a5568;
            margin-top: 1rem; 
            margin-bottom: 1rem;
        }
        .respuestas-lista { /* Contenedor de la lista de respuestas */
            display: flex;
            flex-direction: column;
            gap: 1rem;
            margin-bottom: 1.5rem;
        }
        .TarjetaRespuesta { /* Cada tarjeta de respuesta individual */
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1rem;
        }
        .InfoAutorRespuesta { /* Información del autor de la respuesta */
            font-size: 0.85rem;
            color: #666666;
            margin-bottom: 0.5rem;
        }
        .ContenidoRespuesta { /* Contenido de la respuesta */
            font-size: 0.95rem;
            line-height: 1.5;
            color: #333333;
        }
        .FormularioRespuesta { /* Contenedor del formulario para responder */
            background-color: #f7fafc;
            border: 1px solid #e2e8f0;
            border-radius: 0.5rem;
            padding: 1.5rem;
        }
        .TituloFormularioRespuesta { /* Título del formulario de respuesta */
            font-size: 1.125rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .CampoRespuesta { /* Área de texto para la respuesta */
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #cbd5e0;
            border-radius: 0.375rem;
            margin-bottom: 1rem;
            resize: vertical; /* Permite redimensionar verticalmente */
            font-size: 1rem;
            color: #2d3748;
        }
        .CampoRespuesta:focus { /* Estilo al enfocar el campo */
            outline: none;
            border-color: #667eea; /* Color de foco */
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        .PublicarRespuesta { /* Botón para publicar respuesta */
            background-color: #e4a0d5;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
        }
        .PublicarRespuesta:hover {
            background-color: #e4a0d5;
        }

        /* --- Estilos para el formulario de nuevo tema --- */
        .FormularioNuevoTema { 
            background-color: #f9fafb;
            padding: 1.5rem;
            border-radius: 0.75rem;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .TituloNuevoTema { /* Título del formulario de nuevo tema */
            font-size: 1.5rem;
            font-weight: 600;
            color: #4a5568;
            margin-bottom: 1rem;
        }
        .CamposNuevoFormulario { /* Contenedor de los campos del formulario */
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }
        .EtiquetaCampo { /* Etiquetas de los campos del formulario */
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #4a5568;
            margin-bottom: 0.25rem;
        }
        .CampoTexto { /* Campos de texto (input y textarea) */
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #cbd5e0;
            border-radius: 0.375rem;
            font-size: 1rem;
            color: #2d3748;
        }
        .CampoTexto:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
        }
        .PublicarTema { /* Botón para publicar el nuevo tema */
            background-color: #e4a0d5;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            margin-top: 1rem;
        }
        .PublicarTema:hover {
            background-color: #7a71dc;
        }

</style>