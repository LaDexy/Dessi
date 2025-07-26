<template>

  <!---ESTA ES LA PARTE DE LA INTERACCION EN EL FORO-->
  <div class="foro-interaccion-container">
    <div v-if="loading" class="loading-message">Cargando tema...</div>
    <div v-if="error" class="error-message">{{ error }}</div>

    <div v-if="thread" class="thread-detail">
      <h2>{{ thread.title }}</h2>
      <p class="author-info">Publicado por {{ thread.author }} el {{ formatDate(thread.date) }}</p>
      <p class="thread-content">{{ thread.content }}</p>
      <hr>
      <h3>Respuestas</h3>
      <div v-if="thread.replies && thread.replies.length > 0">
        <div v-for="reply in thread.replies" :key="reply.id_mensaje" class="reply-item">
          <p class="reply-author"><strong>{{ reply.author }}</strong> el {{ formatDate(reply.date) }}</p>
          <p class="reply-content">{{ reply.content }}</p>
          <div class="likes-section">
            <IconoReaccion
              :isLiked="reply.likedByCurrentUser"
              @click="toggleLike(reply)"
              :title="reply.likedByCurrentUser ? 'Quitar Me Gusta' : 'Dar Me Gusta'"
            />
            <span class="likes-count">{{ reply.likesCount }}</span>
            <span class="author-reputation" v-if="reply.reaccion_acumulada_autor !== undefined">
              Reputación del autor: {{ reply.reaccion_acumulada_autor }}
            </span>
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
import IconoReaccion from '@/components/IconoReaccion.vue';

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
        
        let threadData = response.data;

        threadData.replies = threadData.replies.map(reply => ({
          id_mensaje: reply.id,
          author: reply.author,
          date: reply.date,
          content: reply.content,
          likesCount: reply.likesCount || 0,
          likedByCurrentUser: reply.likedByCurrentUser || false,
          reaccion_acumulada_autor: reply.reaccion_acumulada_autor || 0,
          author_profile_pic: reply.author_profile_pic || ''
        }));

        this.thread = threadData;
        console.log('Detalles del tema y respuestas cargados:', this.thread);

      } catch (err) {
        console.error('Error al cargar los detalles del tema:', err);
        this.error = 'No se pudo cargar el tema o sus respuestas. Inténtalo de nuevo más tarde.';
        alert('Error al cargar el tema: ' + (err.response?.data?.message || err.message));
        if (err.response && err.response.status === 404) {
            this.$router.push({ name: 'Foro' });
        }
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return '';
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
          `${this.API_BASE_URL}/replies/${reply.id_mensaje}/like`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.status === 200) {
          const { newLikesCount, likedByCurrentUser, reaccion_acumulada_autor } = res.data; 
          
          const replyIndex = this.thread.replies.findIndex(r => r.id_mensaje === reply.id_mensaje);

          if (replyIndex !== -1) {
            const updatedReply = {
              ...this.thread.replies[replyIndex],
              likesCount: newLikesCount,
              likedByCurrentUser: likedByCurrentUser,
              reaccion_acumulada_autor: reaccion_acumulada_autor
            };

            this.thread.replies.splice(replyIndex, 1, updatedReply);
            
            console.log("Reply actualizada:", this.thread.replies[replyIndex]);
          }
        }
      } catch (error) {
        console.error('Error al dar/quitar "me gusta":', error);
        if (error.response) {
            if (error.response.status === 401 || error.response.status === 403) {
                alert('Tu sesión ha expirado o no estás autorizado. Por favor, inicia sesión.');
                this.$router.push('/login');
            } else if (error.response.status === 404) {
                alert('Respuesta no encontrada.');
            } else {
                alert('Ocurrió un error al procesar tu solicitud: ' + (error.response.data.message || error.message));
            }
        } else {
            alert('Ocurrió un error de red o del servidor.');
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
        this.fetchThreadDetail();
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
.foro-interaccion-container {
    max-width: 900px;
    margin: 40px auto;
    padding: 35px;
    background-color: #ffffff;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
}

.loading-message, .error-message {
    text-align: center;
    padding: 25px;
    font-size: 1.1em;
    font-weight: 500;
    border-radius: 12px;
    margin-top: 20px;
    background-color: #f8f0ff;
    color: #5e1c7d;
    border: 1px solid #d9bad9;
}

.error-message {
    background-color: #ffebeb;
    color: #dc3545;
    border: 1px solid #f5c6cb;
}

.thread-detail h2 {
    font-size: 2.5em;
    color: #5e1c7d;
    margin-bottom: 15px;
    text-align: center;
    font-weight: 800;
    line-height: 1.3;
}

.author-info {
    font-size: 1em;
    color: #666;
    margin-bottom: 25px;
    text-align: center;
    font-style: italic;
    padding-bottom: 15px;
    border-bottom: 1px dashed #eee;
}

.author-info strong {
    color: #5e1c7d;
}

.thread-content {
    background-color: #fcfcfc;
    padding: 25px;
    border-radius: 10px;
    margin-bottom: 30px;
    line-height: 1.7;
    font-size: 1.05em;
    color: #333;
    box-shadow: inset 0 1px 5px rgba(0, 0, 0, 0.05);
    border: 1px solid #f0f0f0;
    white-space: pre-wrap;
}

hr {
    border: 0;
    border-top: 2px solid #f2e6f2;
    margin: 40px 0;
}

h3 {
    font-size: 2.1em;
    color: #5e1c7d;
    margin-bottom: 25px;
    text-align: center;
    font-weight: 700;
    padding-bottom: 10px;
    border-bottom: 2px solid #d9bad9;
}

.reply-item {
    background-color: #fdfafc;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border: 1px solid #d9bad9;
    position: relative;
}

.reply-author {
    font-size: 0.95em;
    color: #666;
    margin-bottom: 8px;
    font-weight: 500;
}

.reply-author strong {
    color: #5e1c7d;
    margin-right: 5px;
}

.reply-content {
    font-size: 1em;
    line-height: 1.6;
    color: #333;
    white-space: pre-wrap;
    margin-bottom: 15px;
}

.likes-section {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9em;
    color: #888;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed #f2e6f2;
}

.likes-section .likes-count {
    font-weight: bold;
    color: #5e1c7d;
    font-size: 1em;
}

.author-reputation {
  font-size: 0.9em;
  color: #666;
  margin-left: 15px;
}

.reply-form {
    margin-top: 40px;
    padding-top: 30px;
    border-top: 2px solid #d9bad9;
    background-color: #f8f0ff;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.reply-form h4 {
    font-size: 1.8em;
    margin-bottom: 20px;
    color: #5e1c7d;
    text-align: center;
    font-weight: 700;
}

.reply-form textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid #d9bad9;
    border-radius: 10px;
    font-size: 1em;
    min-height: 120px;
    margin-bottom: 20px;
    resize: vertical;
    box-sizing: border-box;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    color: #333;
}

.reply-form textarea:focus {
    outline: none;
    border-color: #e4a0d5;
    box-shadow: 0 0 0 4px rgba(228, 160, 213, 0.25);
}

.reply-form button {
    background-color: #e4a0d5;
    color: white;
    padding: 14px 28px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.1em;
    font-weight: bold;
    transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    display: block;
    width: fit-content;
    margin: 0 auto;
}

.reply-form button:hover {
    background-color: #d288c0;
    transform: translateY(-3px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.foro-interaccion-container > p {
    text-align: center;
    padding: 20px;
    font-size: 1.1em;
    color: #777;
    margin-top: 30px;
    font-style: italic;
}

@media (max-width: 768px) {
    .foro-interaccion-container {
        padding: 25px;
        margin: 20px auto;
        width: 95%;
    }
    .thread-detail h2 {
        font-size: 2em;
    }
    h3 {
        font-size: 1.8em;
    }
    .reply-form h4 {
        font-size: 1.5em;
    }
    .reply-form button {
        padding: 12px 20px;
        font-size: 1em;
    }
}

@media (max-width: 480px) {
    .foro-interaccion-container {
        padding: 15px;
        margin: 15px auto;
    }
    .thread-detail h2 {
        font-size: 1.8em;
    }
    .author-info {
        font-size: 0.9em;
    }
    .thread-content, .reply-content {
        font-size: 0.95em;
        padding: 15px;
    }
    h3 {
        font-size: 1.6em;
    }
    .reply-item {
        padding: 15px;
    }
    .reply-author {
        font-size: 0.9em;
    }
    .likes-section {
        font-size: 0.85em;
    }
    .reply-form h4 {
        font-size: 1.3em;
    }
    .reply-form textarea {
        padding: 10px;
        min-height: 100px;
    }
    .reply-form button {
        padding: 10px 18px;
        font-size: 0.95em;
    }
}
</style>