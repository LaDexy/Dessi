<template>
  <div class="modal-overlay" @click.self="$emit('cerrar')">
    <div class="modal-content">
      <span class="close-button" @click="$emit('cerrar')">&times;</span>
      <div v-if="isLoading" class="loading-message">
        <i class="fas fa-spinner fa-spin"></i> Cargando datos de contacto...
      </div>
      <div v-else-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
      </div>
      <div v-else-if="contactData" class="contact-info">
        <h2 class="contact-title">Datos de contacto del emprendedor</h2>
        <div class="contact-list">
          <div v-if="contactData.email" class="contact-item">
            <i class="fas fa-envelope"></i>
            <span class="contact-label">Email:</span>
            <a :href="`mailto:${contactData.email}`">{{ contactData.email }}</a>
          </div>
          <div v-if="contactData.whatsapp" class="contact-item">
            <i class="fab fa-whatsapp"></i>
            <span class="contact-label">WhatsApp:</span>
            <a :href="`https://wa.me/${contactData.whatsapp.replace(/\s/g, '').replace('+', '')}`" target="_blank">{{ contactData.whatsapp }}</a>
          </div>
          <div v-if="contactData.instagram" class="contact-item">
            <i class="fab fa-instagram"></i>
            <span class="contact-label">Instagram:</span>
            <a :href="`https://instagram.com/${contactData.instagram.replace('@', '')}`" target="_blank">{{ contactData.instagram }}</a>
          </div>
          </div>
      </div>
      <div v-else class="no-data-message">
        <p>El emprendedor no proporcionó datos de contacto.</p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: "ModalDatosEmprendedor",
  props: {
    idDesafio: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      contactData: null,
      isLoading: true,
      errorMessage: ''
    };
  },
  async created() {
    await this.fetchContactData();
  },
  methods: {
    async fetchContactData() {
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

        if (response.status === 200 && response.data && response.data.contacto_emprendedor) {
          this.contactData = response.data.contacto_emprendedor;
        } else {
          this.errorMessage = 'No se encontraron datos de contacto.';
        }
      } catch (error) {
        console.error("Error al obtener los datos de contacto:", error);
        this.errorMessage = error.response?.data?.message || "Ocurrió un error al cargar la información. Inténtalo de nuevo.";
      } finally {
        this.isLoading = false;
      }
    }
  }
};
</script>

<style scoped>
/* Copia y pega aquí el CSS que ya tienes en tu componente VistaGanador.vue para el modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 30px;
  border-radius: 10px;
  position: relative;
  max-width: 500px;
  width: 90%;
}
.close-button {
  position: absolute;
  top: 10px;
  right: 15px;
  font-size: 24px;
  cursor: pointer;
}
.contact-title {
  text-align: center;
  margin-bottom: 20px;
}
.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
</style>