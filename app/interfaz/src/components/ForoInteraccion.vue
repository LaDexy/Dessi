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
  name: 'ForoInteraccion',
  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },
  components: {
    IconoReaccion
  },
  data() {
    return {
      thread: null,
      loading: false,
      error: null,
      newReplyContent: '',
      API_BASE_URL: 'http://localhost:4000/api',
    };
  },
  created() {
    this.fetchThreadDetail();
  },
  watch: {
    id: 'fetchThreadDetail'
  },
  methods: {
    getToken() {
      return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    },
    async fetchThreadDetail() {
      this.loading = true;
      this.error = null;
      this.thread = null;

      try {
        const token = this.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await axios.get(`${this.API_BASE_URL}/forum/threads/${this.id}`, { headers });
        this.thread = response.data;
        console.log('Detalles del tema cargados:', this.thread);
      } catch (err) {
        console.error('Error al cargar los detalles del tema:', err);
        this.error = 'No se pudo cargar el tema. Inténtalo de nuevo más tarde.';
        alert('Error al cargar el tema: ' + (err.response?.data?.message || err.message));
        if (err.response && err.response.status === 404) {
            this.$router.push({ name: 'Foro' });
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
      this.$router.push({ name: 'Foro' });
    },
    async toggleLike(reply) {
      const token = this.getToken();
      if (!token) {
        alert('Debes iniciar sesión para dar "me gusta".');
        this.$router.push('/login');
        return;
      }

      try {
        const res = await axios.post(
          `${this.API_BASE_URL}/replies/${reply.id}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
        if (res.data.success) {
          console.log("Respuesta del like:", res.data); // Para depuración

          const replyIndex = this.thread.replies.findIndex(r => r.id === reply.id);

          if (replyIndex !== -1) {
            this.$set(this.thread.replies[replyIndex], 'likesCount', res.data.newLikesCount);
            this.$set(this.thread.replies[replyIndex], 'likedByCurrentUser', res.data.likedByCurrentUser);
            console.log("Reply actualizada:", this.thread.replies[replyIndex]);
          }
          // Opcional: Si quieres un mensaje de éxito, ponlo aquí
          // alert(res.data.message); // Por ejemplo, "Reacción procesada con éxito."
        } else {
          // Esto solo se ejecutará si success es false
          alert('Error al procesar el "me gusta": ' + (res.data.message || 'Error desconocido.'));
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
        const response = await axios.post(
          `${this.API_BASE_URL}/forum/threads/${this.id}/replies`,
          { content: this.newReplyContent },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Respuesta publicada exitosamente!');
        this.newReplyContent = '';
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

<style>
/* Aquí va tu CSS actual para ForoInteraccion.vue */
.foro-interaccion-container {
    max-width: 800px;
    margin: 20px auto;
    padding: 20px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-button {
    background-color: #6a0dad; /* Púrpura */
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 20px;
    font-size: 16px;
}

.back-button:hover {
    background-color: #5a099a; /* Púrpura más oscuro */
}

.loading-message, .error-message {
    text-align: center;
    padding: 20px;
    color: #555;
}

.error-message {
    color: #d32f2f;
}

.thread-detail h2 {
    color: #333;
    font-size: 28px;
    margin-bottom: 10px;
}

.author-info {
    color: #777;
    font-size: 14px;
    margin-bottom: 20px;
}

.thread-content {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 20px;
    line-height: 1.6;
    white-space: pre-wrap; /* Mantiene saltos de línea y espacios */
}

hr {
    border: 0;
    border-top: 1px solid #eee;
    margin: 30px 0;
}

h3 {
    color: #333;
    font-size: 24px;
    margin-bottom: 15px;
}

.reply-item {
    background-color: #f0f0f0;
    padding: 15px;
    border-radius: 5px;
    margin-bottom: 15px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.reply-author {
    font-size: 14px;
    color: #555;
    margin-bottom: 5px;
}

.reply-author strong {
    color: #333;
}

.reply-content {
    font-size: 16px;
    line-height: 1.5;
    white-space: pre-wrap;
    margin-bottom: 10px;
}

.likes-section {
    display: flex;
    align-items: center;
    gap: 8px; /* Espacio entre el icono y el contador */
    font-size: 14px;
    color: #666;
}

.likes-section .likes-count {
    font-weight: bold;
    color: #333;
}

.reply-form {
    margin-top: 30px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.reply-form h4 {
    font-size: 20px;
    margin-bottom: 15px;
    color: #333;
}

.reply-form textarea {
    width: calc(100% - 20px);
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    min-height: 80px;
    margin-bottom: 15px;
    resize: vertical;
}

.reply-form button {
    background-color: #8197FC; /* Azul más claro */
    color: white;
    padding: 12px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease;
}

.reply-form button:hover {
    background-color: #6a7edb; /* Azul más oscuro al pasar el ratón */
}
</style>