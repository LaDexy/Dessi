<template>
  <!--FUNCION EN VEREMOS... ESTABA DESTINADA A UN ICONO PARA QUE EL PERFIL DE DISEÑADOR O MARKETINF PUDIERAN SUBIR PDF
  PERO NO SE HA AGREGADO FUNCIONALIDAD COMPLETA Y SE DESCARTO POR MOMENTO-->
  <div class="Portafolio" v-if="userProfile === 'Diseñador' || userProfile === 'Marketing'">
    <input 
      type="file" 
      ref="fileInput" 
      @change="handleFileChange" 
      style="display: none;" 
      accept=".pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    >

    <i class="fa-solid fa-folder fa-2xl" @click="openFileInput"></i> 
  </div>
</template>

<script>
export default {
  name: "IconoPortafolio",
  props: {
    userProfile: {
      type: String,
      required: true
    }
  },
  methods: {
    openFileInput() {
      this.$refs.fileInput.click();
    },
    handleFileChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.$emit('documentSelected', file); 
      }
      event.target.value = '';
    }
  }
}
</script>

<style scoped>
.Portafolio {
  cursor: pointer;
  display: inline-block;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease-in-out;
}

.Portafolio:hover {
  background-color: rgba(0, 0, 0, 0.1);
  transform: scale(1.1);
}

.Portafolio i {
  color: #555;
}
</style>