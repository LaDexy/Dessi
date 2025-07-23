<!-- VentanaSolicitud.vue -->
<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <h2>Compartir Datos de Contacto con {{ targetProfileName }}</h2>
      <form @submit.prevent="submitRequest">
        <div class="form-group">
          <label for="email">Correo:</label>
          <input type="email" id="email" v-model="contactInfo.email" class="form-control">
        </div>
        <div class="form-group">
          <label for="whatsapp">WhatsApp:</label>
          <input type="text" id="whatsapp" v-model="contactInfo.whatsapp" class="form-control">
        </div>
        <div class="form-group">
          <label for="instagram">Instagram:</label>
          <input type="text" id="instagram" v-model="contactInfo.instagram" class="form-control">
        </div>
        <div class="form-group">
          <label for="tiktok">TikTok:</label>
          <input type="text" id="tiktok" v-model="contactInfo.tiktok" class="form-control">
        </div>
        <div class="form-group">
          <label for="facebook">Facebook:</label>
          <input type="text" id="facebook" v-model="contactInfo.facebook" class="form-control">
        </div>

        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Enviar</button>
          <button type="button" @click="cancelRequest" class="btn btn-secondary">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    targetProfileId: { // ID del usuario al que se le envía la solicitud
      type: Number,
      required: true
    },
    targetProfileName: { // Nombre del usuario al que se le envía la solicitud
      type: String,
      default: ''
    }
  },
  data() {
    return {
      contactInfo: {
        email: '',
        whatsapp: '',
        instagram: '',
        tiktok: '',
        facebook: ''
      }
    };
  },
  methods: {
    submitRequest() {
      // Emite un evento con los datos de contacto y el ID del receptor
      this.$emit('send-contact-request', {
        id_receptor: this.targetProfileId, // Usamos id_receptor para coincidir con la DB
        contactDetails: this.contactInfo
      });
      this.resetForm();
    },
    cancelRequest() {
      this.$emit('close'); // Emite un evento para que el padre cierre el modal
      this.resetForm();
    },
    resetForm() {
      // Resetea el formulario después de enviar o cancelar
      this.contactInfo = {
        email: '',
        whatsapp: '',
        instagram: '',
        tiktok: '',
        facebook: ''
      };
    }
  }
};
</script>

<style scoped>
/* Estilos básicos para el modal (puedes usar Bootstrap para un mejor look) */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
}
.modal-actions {
  margin-top: 20px;
  text-align: right;
}
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin-left: 10px;
}
.btn-primary {
  background-color: #007bff;
  color: white;
}
.btn-secondary {
  background-color: #6c757d;
  color: white;
}
</style>