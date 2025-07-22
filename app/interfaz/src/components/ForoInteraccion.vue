<template>
  <div class="foro-interaccion-container">
    <button @click="goBackToForum" class="back-button">Volver al Foro</button>
    <div v-if="loading" class="loading-message">Cargando tema...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="thread" class="thread-detail">
      <h2>{{ thread.title }}</h2>
      <p class="author-info">Publicado por {{ thread.author }} el {{ formatDate(thread.date) }}</p>
      <p class="thread-content">{{ thread.content }}</p>
      <hr>
      <h3>Respuestas</h3>
      <div v-if="thread.replies && thread.replies.length > 0">
        <div v-for="reply in thread.replies" :key="reply.id" class="reply-item">
          <p class="reply-author"><strong>{{ reply.author }}</strong> el {{ formatDate(reply.date) }}</p>
          <p class="reply-content">{{ reply.content }}</p>
          <div class="likes-section">
            <IconoReaccion
              :isLiked="reply.likedByCurrentUser"
              @click="toggleLike(reply)"
              :title="reply.likedByCurrentUser ? 'Quitar Me Gusta' : 'Dar Me Gusta'"
            />
            <span class="likes-count">{{ reply.likesCount }}</span>
          </div>
        </div>
      </div>
      <div v-else>
        <p>Aún no hay respuestas para este tema. ¡Sé el primero en comentar!</p>
      </div>

      <div class="reply-form">
        <h4>Añadir una respuesta</h4>
        <textarea v-model="newReplyContent" rows="4" placeholder="Escribe tu respuesta aquí..."></textarea>
        <button @click="submitReply">Publicar Respuesta</button>
      </div>

    </div>
    <div v-else-if="!loading && !error">
      <p>Tema no encontrado.</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import IconoReaccion from '@/components/IconoReaccion.vue'; // Asegúrate de que esta ruta sea correcta

export default {
  name: 'ForoInteraccion', // Este es el nombre correcto del componente
  props: {
    id: { // Este 'id' viene del parámetro de la ruta '/foro/:id' gracias a 'props: true'
      type: [String, Number],
      required: true
    }
  },
  components: {
    IconoReaccion // Registra el componente IconoReaccion aquí
  },
  data() {
    return {
      thread: null,
      loading: false,
      error: null,
      newReplyContent: '', // Para el formulario de respuesta
      API_BASE_URL: 'http://localhost:4000/api', // URL base de tu API de Express
    };
  },
  created() {
    this.fetchThreadDetail();
  },
  watch: {
    // Escuchar cambios en la prop 'id' si el usuario navega entre temas sin recargar el componente
    id: 'fetchThreadDetail'
  },
  methods: {
    getToken() {
      // Usar la misma lógica de getToken que en ForoUsuarios.vue
      return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    },
    async fetchThreadDetail() {
      this.loading = true;
      this.error = null;
      this.thread = null; // Limpiar el tema anterior si se está recargando

      try {
        const token = this.getToken(); // Obtener el token para la solicitud
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // La ruta del backend para obtener el detalle del tema y sus respuestas
        const response = await axios.get(`${this.API_BASE_URL}/forum/threads/${this.id}`, { headers });
        this.thread = response.data;
        console.log('Detalles del tema cargados:', this.thread);
      } catch (err) {
        console.error('Error al cargar los detalles del tema:', err);
        this.error = 'No se pudo cargar el tema. Inténtalo de nuevo más tarde.';
        alert('Error al cargar el tema: ' + (err.response?.data?.message || err.message));
        // Si el tema no se encuentra (404), podrías redirigir a la lista de foros
        if (err.response && err.response.status === 404) {
            this.$router.push({ name: 'Foro' }); // Asegúrate que 'Foro' sea el nombre de tu ruta para la lista
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    goBackToForum() {
      this.$router.push({ name: 'Foro' }); // Volver a la lista de temas
    },
    async toggleLike(reply) {
      const token = this.getToken();
      if (!token) {
        alert('Debes iniciar sesión para dar "me gusta".');
        this.$router.push('/login'); // Redirige al login
        return;
      }

      try {
        // Nueva ruta POST para dar/quitar like a una respuesta específica
        const res = await axios.post(
          `${this.API_BASE_URL}/replies/${reply.id}/like`,
          {}, // Body vacío para POST
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.data.success) {
          // Actualiza reactivamente el contador y el estado del "me gusta" en la respuesta
          reply.likesCount = res.data.newLikesCount;
          reply.likedByCurrentUser = res.data.likedByCurrentUser;
        } else {
          alert('Error al procesar el "me gusta": ' + res.data.message);
        }
      } catch (error) {
        console.error('Error al dar/quitar "me gusta":', error);
        if (error.response && error.response.status === 401) {
            alert('Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión.');
            this.$router.push('/login');
        } else {
            alert('Ocurrió un error al procesar tu solicitud.');
        }
      }
    },
    async submitReply() {
      if (!this.newReplyContent.trim()) {
        alert('Por favor, escribe tu respuesta.');
        return;
      }
      const token = this.getToken();
      if (!token) {
        alert('Debes iniciar sesión para publicar una respuesta.');
        this.$router.push('/login');
        return;
      }

      try {
        // Ruta POST para añadir respuestas al backend
        const response = await axios.post(
          `${this.API_BASE_URL}/forum/threads/${this.id}/replies`,
          { content: this.newReplyContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Respuesta publicada exitosamente!');
        this.newReplyContent = ''; // Limpiar el campo
        this.fetchThreadDetail(); // Recargar el tema para ver la nueva respuesta y su estado inicial de likes
        console.log('Respuesta enviada:', response.data);
      } catch (error) {
        console.error('Error al publicar respuesta:', error.response?.data || error.message);
        alert('Error al publicar respuesta: ' + (error.response?.data?.message || 'Error desconocido.'));
      }
    }
  }
};
</script>

<style scoped>
/* Tus estilos CSS existentes para este componente */
.foro-interaccion-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  background-color: #6a0dad;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 1em;
}

.back-button:hover {
  background-color: #5a099a;
}

.thread-detail, .reply-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.thread-detail h2, .reply-form h4, h3 {
  color: #333;
}

.author-info, .reply-author {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 10px;
}

.likes-section {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.likes-count {
  font-size: 0.9em;
  color: #555;
  margin-left: 5px; /* Espacio entre el icono y el número */
}

.reply-form textarea {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.reply-form button {
  background-color: #6a0dad;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.reply-form button:hover {
  background-color: #5a099a;
}

.loading-message, .error-message {
    text-align: center;
    padding: 20px;
    color: #888;
}
.error-message {
    color: #d9534f;
}
</style>