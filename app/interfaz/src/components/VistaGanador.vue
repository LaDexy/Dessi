<template>
  <div class="winner-view-container">
    <div v-if="isLoading" class="loading-message">
      <i class="fas fa-spinner fa-spin"></i> Cargando detalles del desafío...
    </div>
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <router-link to="/mis-desafios" class="back-link">Volver a mis desafíos</router-link>
    </div>
    <div v-else-if="challengeData" class="winner-content">
      <div class="congratulations-card">
        <i class="fas fa-trophy winner-icon"></i>
        <h1 class="congratulations-title">¡Felicidades, has ganado!</h1>
        <p class="congratulations-text">Tu propuesta ha sido seleccionada como ganadora para el desafío:</p>
        <h2 class="challenge-name">{{ challengeData.nombre_desafio }}</h2>
      </div>

      <div class="contact-card">
        <h3 class="contact-title">Datos de contacto del emprendedor</h3>
        <p class="contact-description">Utiliza la siguiente información para ponerte en contacto y coordinar los próximos pasos:</p>
        
       <div class="contact-list">
  <div v-if="challengeData.contacto_emprendedor.email" class="contact-item">
    <i class="fas fa-envelope"></i>
    <span class="contact-label">Email:</span>
    <a :href="`mailto:${challengeData.contacto_emprendedor.email}`">{{ challengeData.contacto_emprendedor.email }}</a>
  </div>
  <div v-if="challengeData.contacto_emprendedor.whatsapp" class="contact-item">
    <i class="fab fa-whatsapp"></i>
    <span class="contact-label">WhatsApp:</span>
    <a :href="`https://wa.me/${challengeData.contacto_emprendedor.whatsapp.replace(/\s/g, '').replace('+', '')}`" target="_blank">{{ challengeData.contacto_emprendedor.whatsapp }}</a>
  </div>
  <div v-if="challengeData.contacto_emprendedor.instagram" class="contact-item">
    <i class="fab fa-instagram"></i>
    <span class="contact-label">Instagram:</span>
    <a :href="`https://instagram.com/${challengeData.contacto_emprendedor.instagram.replace('@', '')}`" target="_blank">{{ challengeData.contacto_emprendedor.instagram }}</a>
  </div>
  <div v-if="challengeData.contacto_emprendedor.tiktok" class="contact-item">
    <i class="fab fa-tiktok"></i>
    <span class="contact-label">TikTok:</span>
    <a :href="`https://tiktok.com/@${challengeData.contacto_emprendedor.tiktok.replace('@', '')}`" target="_blank">{{ challengeData.contacto_emprendedor.tiktok }}</a>
  </div>
  <div v-if="challengeData.contacto_emprendedor.facebook" class="contact-item">
    <i class="fab fa-facebook"></i>
    <span class="contact-label">Facebook:</span>
    <a :href="`https://facebook.com/${challengeData.contacto_emprendedor.facebook}`" target="_blank">{{ challengeData.contacto_emprendedor.facebook }}</a>
  </div>
  <div v-if="!challengeData.contacto_emprendedor.email && !challengeData.contacto_emprendedor.whatsapp && !challengeData.contacto_emprendedor.instagram && !challengeData.contacto_emprendedor.tiktok && !challengeData.contacto_emprendedor.facebook" class="contact-item no-contact">
    <p>El emprendedor no proporcionó datos de contacto.</p>
  </div>
</div>
      
      <router-link to="/mis-desafios" class="back-button">Volver a mis desafíos</router-link>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "VistaGanador",
  props: {
    idDesafio: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      challengeData: null,
      isLoading: true,
      errorMessage: ''
    };
  },
  async created() {
    await this.fetchWinnerData();
  },
  methods: {
    async fetchWinnerData() {
      this.isLoading = true;
      this.errorMessage = '';
      try {
        const token = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
        if (!token) {
          this.errorMessage = 'No estás autenticado. Por favor, inicia sesión.';
          this.isLoading = false;
          return;
        }

        const response = await axios.get(`http://localhost:4000/api/desafios/${this.idDesafio}/ganador`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 200) {
          this.challengeData = response.data;
          console.log("Datos de ganador y contacto recibidos:", this.challengeData);
        } else {
          throw new Error(response.data.message || "Error al cargar los detalles del desafío.");
        }

      } catch (error) {
        console.error("Error al obtener los datos de ganador:", error);
        this.errorMessage = error.response?.data?.message || "Ocurrió un error al cargar la información. Inténtalo de nuevo.";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
.winner-view-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #f0f4f8;
  padding: 30px;
}

.winner-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 700px;
  width: 100%;
  text-align: center;
}

.congratulations-card, .contact-card {
  background-color: #ffffff;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

.winner-icon {
  font-size: 4em;
  color: #f2bc00;
  margin-bottom: 20px;
}

.congratulations-title {
  font-size: 2.5em;
  color: #5e1c7d;
  font-weight: bold;
  margin-bottom: 10px;
}

.congratulations-text {
  font-size: 1.2em;
  color: #555;
  margin-bottom: 15px;
}

.challenge-name {
  font-size: 1.8em;
  color: #333;
  font-weight: bold;
  background-color: #f5f5f5;
  padding: 10px 20px;
  border-radius: 10px;
  display: inline-block;
}

.contact-title {
  font-size: 2em;
  color: #5e1c7d;
  margin-bottom: 15px;
}

.contact-description {
  font-size: 1em;
  color: #777;
  margin-bottom: 25px;
}

.contact-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
  text-align: left;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 15px;
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 12px;
  border: 1px solid #eee;
  font-size: 1.1em;
}

.contact-item i {
  font-size: 1.5em;
  color: #5e1c7d;
  width: 30px;
  text-align: center;
}

.contact-label {
  font-weight: 600;
  color: #333;
}

.contact-item a {
  color: #007bff;
  text-decoration: none;
  word-break: break-all;
}

.contact-item a:hover {
  text-decoration: underline;
}

.contact-item.no-contact p {
  width: 100%;
  text-align: center;
  color: #888;
  font-style: italic;
}

.back-button {
  display: inline-block;
  padding: 15px 30px;
  background-color: hsl(300, 40%, 74%);
  color: white;
  text-decoration: none;
  border-radius: 12px;
  font-weight: bold;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.back-button:hover {
  background-color: hsl(300, 50%, 71%);
  transform: translateY(-2px);
}

.loading-message, .error-message {
  text-align: center;
  font-size: 1.2em;
  color: #555;
}

.error-message {
  background-color: #f8d7da;
  color: #721c24;
  padding: 20px;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
}
</style>