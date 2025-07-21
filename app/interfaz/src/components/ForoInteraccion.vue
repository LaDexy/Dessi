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

export default {
  name: 'ForoInteraccion',
  props: {
    id: { // Este 'id' viene del parámetro de la ruta '/foro/:id' gracias a 'props: true'
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      thread: null,
      loading: false,
      error: null,
      newReplyContent: '' // Para el formulario de respuesta
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
        const response = await axios.get(`http://localhost:4000/api/forum/threads/${this.id}`);
        this.thread = response.data;
        console.log('Detalles del tema cargados:', this.thread);
      } catch (err) {
        console.error('Error al cargar los detalles del tema:', err);
        this.error = 'No se pudo cargar el tema. Inténtalo de nuevo más tarde.';
        alert('Error al cargar el tema: ' + (err.response?.data?.message || err.message));
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
    async submitReply() {
      // Implementación futura para enviar respuestas al backend
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
        // Asumiendo una ruta POST /api/forum/threads/:id/replies en tu backend
        const response = await axios.post(
          `http://localhost:4000/api/forum/threads/${this.id}/replies`,
          { content: this.newReplyContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Respuesta publicada exitosamente!');
        this.newReplyContent = ''; // Limpiar el campo
        this.fetchThreadDetail(); // Recargar el tema para ver la nueva respuesta
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
/* Añade estilos para tu componente ForoInteraccion aquí */
.foro-interaccion-container {
  padding: 20px;
  max-width: 800px;
  margin: 20px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
  background-color: #6a0dad; /* Color morado */
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-bottom: 20px;
  font-size: 1em;
}

.back-button:hover {
  background-color: #5a0a9c; /* Un morado más oscuro al pasar el ratón */
}

.loading-message, .error-message {
  text-align: center;
  margin-top: 20px;
  font-size: 1.1em;
}

.error-message {
  color: red;
}

.thread-detail h2 {
  color: #333;
  margin-bottom: 10px;
}

.author-info {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 20px;
}

.thread-content {
  font-size: 1.1em;
  line-height: 1.6;
  color: #444;
  white-space: pre-wrap; /* Para preservar saltos de línea del contenido */
}

hr {
  border: 0;
  height: 1px;
  background: #eee;
  margin: 30px 0;
}

.reply-item {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 5px;
  padding: 15px;
  margin-bottom: 15px;
}

.reply-author {
  font-weight: bold;
  color: #555;
  margin-bottom: 5px;
}

.reply-content {
  color: #333;
  line-height: 1.5;
}

.reply-form {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.reply-form h4 {
  margin-bottom: 15px;
  color: #333;
}

.reply-form textarea {
  width: calc(100% - 20px);
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  resize: vertical; /* Permite redimensionar verticalmente */
}

.reply-form button {
  background-color: #007bff; /* Un azul para el botón de respuesta */
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
}

.reply-form button:hover {
  background-color: #0056b3; /* Azul más oscuro al pasar el ratón */
}
</style>