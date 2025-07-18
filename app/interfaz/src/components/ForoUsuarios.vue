<template>
  <div>
    <!--Rectangulo de arriba de texto de foro-->
    <div class="RectanguloForo">
      <div class="rectangulo"></div>
      <h1 class="titulo-foro">Foro de la Comunidad</h1>
    </div>

    <!-- Cuerpo inicial del foro-->
    <div class="forum-container">
      <!-- Vista de Lista de Temas -->
      <div v-if="currentView === 'topicList'" class="ListaTemas">
        <div class="titulo-temas">
          <h2 class="Seccion">Temas Recientes</h2>
          <button class="NuevoTema" @click="showNewTopicForm">
            Crear Nuevo Tema
          </button>
        </div>

        <!-- Mensaje de carga o error -->
        <div v-if="loading" class="loading-message">Cargando temas...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <!-- Lista de temas -->
        <div class="TarjetasTemas">
          <div
            v-for="topic in forumData"
            :key="topic.id_foro"
            class="TarjetaIndividual"
            @click="showTopicDetail(topic.id_foro)"
          >
            <h3>{{ topic.titulo }}</h3>
            <p>
              Publicado por
              <span class="author-info">
                <img
                  :src="topic.foto_perfil_url || 'https://placehold.co/30x30/cccccc/ffffff?text=User'"
                  alt="Foto de perfil"
                  style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px; object-fit: cover;"
                />
                <span style="font-weight: bold; color: #007bff;">{{ topic.nombre_usuario }}</span>
              </span>
              el {{ formatDate(topic.fecha_creacion) }}
            </p>
            <div class="InfoAdicional">
              <span>{{ topic.numero_mensajes }} Respuestas</span>
            </div>
          </div>
          <div v-if="forumData.length === 0 && !loading && !error" class="text-center text-gray-500 py-8">
            No hay temas disponibles. ¡Sé el primero en crear uno!
          </div>
        </div>
      </div>

      <!-- Vista de Detalle del Tema -->
      <div v-else-if="currentView === 'topicDetail'" class="DetalleTemas">
        <button class="VolverBoton" @click="showTopicList">← Volver al Foro</button>

        <div v-if="loading" class="loading-message">Cargando detalles del tema...</div>
        <div v-if="error" class="error-message">{{ error }}</div>

        <div v-if="currentTopic" class="PrimerTema">
          <h3>{{ currentTopic.titulo }}</h3>
          <p class="InfoAutor">
            Publicado por
            <span class="author-info">
                <img
                  :src="currentTopic.foto_perfil_url || 'https://placehold.co/30x30/cccccc/ffffff?text=User'"
                  alt="Foto de perfil"
                  style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px; object-fit: cover;"
                />
                <span style="font-weight: bold; color: #007bff;">{{ currentTopic.nombre_usuario }}</span>
            </span>
            el {{ formatDate(currentTopic.fecha_creacion) }}
          </p>
          <p class="contenido-tema">{{ currentTopic.descripcion }}</p>
        </div>

        <h4 class="Respuestas">Respuestas</h4>
        <div class="respuestas-lista">
          <div v-for="reply in currentTopicMessages" :key="reply.id_mensaje" class="TarjetaRespuesta">
            <p class="InfoAutorRespuesta">
              <span class="author-info">
                <img
                  :src="reply.foto_perfil_url || 'https://placehold.co/30x30/cccccc/ffffff?text=User'"
                  alt="Foto de perfil"
                  style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px; object-fit: cover;"
                />
                <span style="font-weight: bold; color: #007bff;">{{ reply.nombre_usuario }}</span>
              </span>
              el {{ formatDate(reply.fecha_publicacion) }}
            </p>
            <p class="ContenidoRespuesta">{{ reply.contenido }}</p>
            <div class="reaction-info">
              <span>{{ reply.numero_reacciones }} Reacciones</span>
              <span v-if="reply.tipos_reaccion_existentes && reply.tipos_reaccion_existentes.length > 0">
                ({{ reply.tipos_reaccion_existentes.join(', ') }})
              </span>
              <button @click="toggleReaction(reply.id_mensaje, 'like')" class="reaction-button">👍</button>
              <button @click="toggleReaction(reply.id_mensaje, 'love')" class="reaction-button">❤️</button>
              <button @click="toggleReaction(reply.id_mensaje, 'haha')" class="reaction-button">😂</button>
              <!-- Muestra el botón de eliminar reacción solo si el usuario logueado ha reaccionado a este mensaje -->
              <button v-if="loggedInUser && reply.reactions && reply.reactions.some(r => r.userId === loggedInUser.id)"
                      @click="deleteReaction(reply.id_mensaje)"
                      class="reaction-button">❌</button>
            </div>
          </div>
          <div v-if="currentTopicMessages.length === 0 && !loading && !error" class="text-center text-gray-500 py-4">
            Sé el primero en comentar en este tema.
          </div>
        </div>

        <div class="FormularioRespuesta">
          <h5 class="TituloFormularioRespuesta">Deja una Respuesta</h5>
          <textarea v-model="replyContent" class="CampoRespuesta" rows="4" placeholder="Escribe tu respuesta aquí..."></textarea>
          <button class="PublicarRespuesta" @click="postReply" :disabled="loading || !loggedInUser">
            {{ loading ? 'Publicando...' : 'Publicar Respuesta' }}
          </button>
          <p v-if="!loggedInUser" class="text-sm text-red-500 mt-2">Debes iniciar sesión para poder responder.</p>
        </div>
      </div>

      <!-- Formulario para Crear Nuevo Tema -->
      <div v-else-if="currentView === 'newTopicForm'" class="FormularioNuevoTema">
        <button class="VolverBoton" @click="showTopicList">← Cancelar</button>
        <h2 class="TituloNuevoTema">Crear Nuevo Tema</h2>
        <div class="CamposNuevoFormulario">
          <div>
            <label for="newTopicTitle" class="EtiquetaCampo">Título del Tema</label>
            <input type="text" id="newTopicTitle" v-model="newTopicTitle" class="CampoTexto">
          </div>
          <div>
            <label for="newTopicContent" class="EtiquetaCampo">Contenido</label>
            <textarea id="newTopicContent" v-model="newTopicContent" class="CampoTexto" rows="8"></textarea>
          </div>
          <button class="PublicarTema" @click="createNewTopic" :disabled="loading || !loggedInUser">
            {{ loading ? 'Creando...' : 'Publicar Tema' }}
          </button>
          <p v-if="!loggedInUser" class="text-sm text-red-500 mt-2">Debes iniciar sesión para poder crear un tema.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Importa jwtDecode para decodificar el token

export default {
  name: "ForoUsuarios",
  data() {
    return {
      forumData: [], // Almacena la lista de temas del foro
      currentTopic: null, // Almacena los detalles del tema seleccionado
      currentTopicMessages: [], // Almacena los comentarios del tema seleccionado
      currentView: 'topicList', // Controla la vista actual: 'topicList', 'topicDetail', 'newTopicForm'
      newTopicTitle: '', // v-model para el título del nuevo tema
      newTopicContent: '', // v-model para el contenido del nuevo tema
      replyContent: '', // v-model para el contenido de la respuesta
      loading: false, // Indica si hay una operación de carga en curso
      error: null, // Almacena mensajes de error
      loggedInUser: null, // Almacena la información del usuario autenticado (id, username)
    };
  },
  async mounted() {
    // Al cargar el componente, primero intentamos decodificar el token de autenticación
    this.decodeAuthToken();
    // Luego, cargamos la lista de temas del foro
    this.fetchTopics();
  },
  methods: {
    /**
     * Formatea una cadena de fecha a un formato legible en español.
     * @param {string} dateString - La cadena de fecha a formatear.
     * @returns {string} La fecha formateada o la cadena original si es inválida.
     */
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateString);
        return dateString; // Devuelve la cadena original si es inválida
      }
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('es-ES', options);
    },

    /**
     * Obtiene las cabeceras de autorización con el token JWT.
     * @returns {Object} Un objeto con la cabecera de autorización o vacío si no hay token.
     */
    getAuthHeaders() {
      const token = localStorage.getItem('token');
      return token ? { Authorization: `Bearer ${token}` } : {};
    },

    /**
     * Decodifica el token JWT almacenado en localStorage para obtener la información del usuario.
     * Si el token es inválido o no existe, limpia el usuario logueado.
     */
    decodeAuthToken() {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          this.loggedInUser = {
            id: decoded.id, // ID del usuario desde el token (generalmente _id de MongoDB)
            username: decoded.username, // Nombre de usuario desde el token
          };
          console.log('Usuario logueado decodificado del token:', this.loggedInUser);
        } catch (error) {
          console.error('Error al decodificar el token JWT:', error);
          this.loggedInUser = null;
          localStorage.removeItem('token'); // Eliminar token inválido
        }
      } else {
        this.loggedInUser = null;
        console.warn('No hay token de autenticación. Algunas funcionalidades podrían no estar disponibles.');
      }
    },

    /**
     * Obtiene todos los temas del foro desde el backend.
     */
    async fetchTopics() {
      this.loading = true;
      this.error = null;
      try {
        // Cambiado a puerto 4000 y ruta sin /api/foros
        const response = await axios.get('http://localhost:4000/topics');
        // Mapea los datos del backend a la estructura esperada por el frontend
        this.forumData = response.data.map(topic => ({
          ...topic,
          id_foro: topic._id, // Mapea _id de MongoDB a id_foro
          titulo: topic.title, // Mapea title a titulo
          nombre_usuario: topic.author, // Mapea author a nombre_usuario
          fecha_creacion: topic.createdAt, // Mapea createdAt a fecha_creacion
          numero_mensajes: topic.comments ? topic.comments.length : 0, // Calcula número de respuestas
          foto_perfil_url: 'https://placehold.co/30x30/cccccc/ffffff?text=User' // Placeholder
        }));
        console.log('Temas del foro cargados:', this.forumData);
      } catch (err) {
        this.error = 'Error al cargar los temas del foro: ' + (err.response?.data?.message || err.message);
        console.error(this.error, err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene los detalles de un tema específico y sus comentarios.
     * @param {string} topicId - El ID del tema a cargar.
     */
    async fetchTopicDetail(topicId) {
      this.loading = true;
      this.error = null;
      try {
        // Obtener detalles del tema (incluye comentarios en el nuevo backend)
        const topicResponse = await axios.get(`http://localhost:4000/topics/${topicId}`);
        this.currentTopic = {
          ...topicResponse.data,
          id_foro: topicResponse.data._id, // Mapea _id de MongoDB a id_foro
          titulo: topicResponse.data.title, // Mapea title a titulo
          nombre_usuario: topicResponse.data.author, // Mapea author a nombre_usuario
          fecha_creacion: topicResponse.data.createdAt, // Mapea createdAt a fecha_creacion
          descripcion: topicResponse.data.content, // Mapea content a descripcion
        };

        // Los comentarios (mensajes) ya vienen dentro del objeto del tema
        this.currentTopicMessages = topicResponse.data.comments.map(comment => ({
          ...comment,
          id_mensaje: comment._id, // Mapea _id de MongoDB a id_mensaje
          nombre_usuario: comment.author, // Mapea author a nombre_usuario
          fecha_publicacion: comment.createdAt, // Mapea createdAt a fecha_publicacion
          contenido: comment.content, // Mapea content a contenido
          foto_perfil_url: 'https://placehold.co/30x30/cccccc/ffffff?text=User', // Placeholder
          numero_reacciones: comment.reactions ? comment.reactions.length : 0, // Calcula número de reacciones
          tipos_reaccion_existentes: this.getReactionTypes(comment.reactions), // Obtiene tipos de reacción
        }));

        this.currentView = 'topicDetail';
        console.log('Detalles del tema y mensajes cargados:', this.currentTopic, this.currentTopicMessages);
      } catch (err) {
        this.error = 'Error al cargar los detalles del tema: ' + (err.response?.data?.message || err.message);
        console.error(this.error, err);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Helper para obtener los tipos únicos de reacciones de un array de reacciones.
     * @param {Array} reactions - Array de objetos de reacción.
     * @returns {Array} Array de cadenas con los tipos de reacción únicos.
     */
    getReactionTypes(reactions) {
        if (!reactions || reactions.length === 0) return [];
        const types = new Set();
        reactions.forEach(r => types.add(r.type));
        return Array.from(types);
    },

    // --- Funciones de Navegación ---

    /**
     * Cambia la vista a la lista de temas y recarga los temas.
     */
    showTopicList() {
      this.currentView = 'topicList';
      this.currentTopic = null; // Limpia el tema actual
      this.currentTopicMessages = []; // Limpia los mensajes del tema actual
      this.fetchTopics(); // Recargar la lista de temas al volver
    },

    /**
     * Muestra los detalles de un tema específico.
     * @param {string} topicId - El ID del tema a mostrar.
     */
    async showTopicDetail(topicId) {
      await this.fetchTopicDetail(topicId);
    },

    /**
     * Muestra el formulario para crear un nuevo tema.
     * Requiere que el usuario esté logueado.
     */
    showNewTopicForm() {
      if (!this.loggedInUser) {
        console.error('Debes iniciar sesión para crear un nuevo tema.');
        alert('Debes iniciar sesión para crear un nuevo tema.');
        return;
      }
      this.currentView = 'newTopicForm';
      this.newTopicTitle = ''; // Limpia los campos del formulario
      this.newTopicContent = '';
    },

    // --- Funciones de Interacción con el Backend ---

    /**
     * Envía una solicitud al backend para crear un nuevo tema.
     * Requiere que el usuario esté logueado y que los campos estén completos.
     */
    async createNewTopic() {
      if (!this.loggedInUser) {
        console.error('Debes iniciar sesión para crear un nuevo tema.');
        alert('Debes iniciar sesión para crear un nuevo tema.');
        return;
      }

      if (this.newTopicTitle.trim() === '' || this.newTopicContent.trim() === '') {
        console.error('Por favor, completa el título y el contenido del tema.');
        alert('Por favor, completa el título y el contenido del tema.');
        return;
      }

      this.loading = true;
      this.error = null;
      try {
        // Cambiado a puerto 4000 y ruta sin /api/foros
        // Los nombres de los campos en el payload coinciden con el backend (title, content)
        const response = await axios.post('http://localhost:4000/topics', {
          title: this.newTopicTitle.trim(),
          content: this.newTopicContent.trim(),
        }, { headers: this.getAuthHeaders() });

        console.log('Tema creado:', response.data);
        this.showTopicList(); // Volver a la lista y recargar
      } catch (err) {
        this.error = 'Error al crear el tema: ' + (err.response?.data?.message || err.message);
        console.error(this.error, err);
        alert('Error al crear el tema: ' + (err.response?.data?.message || err.message));
      } finally {
        this.loading = false;
      }
    },

    /**
     * Envía una solicitud al backend para publicar una respuesta (comentario) en un tema.
     * Requiere que el usuario esté logueado y que el contenido de la respuesta no esté vacío.
     */
    async postReply() {
      if (!this.loggedInUser) {
        console.error('Debes iniciar sesión para publicar una respuesta.');
        alert('Debes iniciar sesión para publicar una respuesta.');
        return;
      }

      if (this.replyContent.trim() === '') {
        console.error('Por favor, escribe tu respuesta.');
        alert('Por favor, escribe tu respuesta.');
        return;
      }

      if (this.currentTopic) {
        this.loading = true;
        this.error = null;
        try {
          // Cambiado a puerto 4000 y ruta con topicId y comments
          // Usamos currentTopic.id_foro (que es _id) y el campo 'content'
          const response = await axios.post(`http://localhost:4000/topics/${this.currentTopic.id_foro}/comments`, {
            content: this.replyContent.trim(),
          }, { headers: this.getAuthHeaders() });

          console.log('Respuesta publicada:', response.data);
          this.replyContent = ''; // Limpia el campo de respuesta
          // Recargar los mensajes del tema actual para ver la nueva respuesta
          await this.fetchTopicDetail(this.currentTopic.id_foro);
        } catch (err) {
          this.error = 'Error al publicar la respuesta: ' + (err.response?.data?.message || err.message);
          console.error(this.error, err);
          alert('Error al publicar la respuesta: ' + (err.response?.data?.message || err.message));
        } finally {
          this.loading = false;
        }
      }
    },

    /**
     * Envía una solicitud al backend para añadir o actualizar una reacción a un comentario.
     * @param {string} mensajeId - El ID del comentario al que se le añade la reacción.
     * @param {string} tipoReaccion - El tipo de reacción (ej. 'like', 'love').
     * Requiere que el usuario esté logueado.
     */
    async toggleReaction(mensajeId, tipoReaccion) {
        if (!this.loggedInUser) {
            console.error('Debes iniciar sesión para reaccionar.');
            alert('Debes iniciar sesión para reaccionar.');
            return;
        }
        if (!this.currentTopic || !this.currentTopic.id_foro) {
            console.error('No hay un tema actual para reaccionar.');
            return;
        }
        try {
            // Nueva ruta que incluye topicId y commentId
            const response = await axios.post(`http://localhost:4000/topics/${this.currentTopic.id_foro}/comments/${mensajeId}/reactions`,
                { type: tipoReaccion }, // El backend espera 'type'
                { headers: this.getAuthHeaders() }
            );
            console.log('Reacción gestionada:', response.data);
            // Recargar los mensajes para actualizar las reacciones mostradas
            await this.fetchTopicDetail(this.currentTopic.id_foro);
        } catch (err) {
            console.error('Error al gestionar la reacción:', err.response?.data?.message || err.message);
            alert('Error al gestionar la reacción: ' + (err.response?.data?.message || err.message));
        }
    },

    /**
     * Envía una solicitud al backend para eliminar todas las reacciones de un usuario en un comentario.
     * @param {string} mensajeId - El ID del comentario del que se eliminarán las reacciones.
     * Requiere que el usuario esté logueado.
     */
    async deleteReaction(mensajeId) {
        if (!this.loggedInUser) {
            console.error('Debes iniciar sesión para eliminar una reacción.');
            alert('Debes iniciar sesión para eliminar una reacción.');
            return;
        }
        if (!this.currentTopic || !this.currentTopic.id_foro) {
            console.error('No hay un tema actual para eliminar reacción.');
            return;
        }
        try {
            // Nueva ruta que incluye topicId y commentId
            const response = await axios.delete(`http://localhost:4000/topics/${this.currentTopic.id_foro}/comments/${mensajeId}/reactions`,
                { headers: this.getAuthHeaders() }
            );
            console.log('Reacción eliminada:', response.data);
            // Recargar los mensajes para actualizar las reacciones mostradas
            await this.fetchTopicDetail(this.currentTopic.id_foro);
        } catch (err) {
            console.error('Error al eliminar la reacción:', err.response?.data?.message || err.message);
            alert('Error al eliminar la reacción: ' + (err.response?.data?.message || err.message));
        }
    }
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