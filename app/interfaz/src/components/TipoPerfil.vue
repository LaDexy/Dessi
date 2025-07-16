<template>
  <div class="tipo-perfil-container">
    <h2>{{ profileType }}</h2>
    <div class="Descripcion-editable-wrapper">
      <h3 v-if="!isEditing">
        {{ description || 'Aca va una breve descripcion' }}
      </h3>
      <textarea
        v-else
        v-model="editableDescription"
        class="description-textarea"
        ref="descriptionInput"
      ></textarea>
      
      <IconoEditar v-if="!isEditing" @click="startEditing" class="edit-description-icon-position" />

      <div v-if="isEditing" class="edit-actions">
        <button @click="saveDescription">Guardar</button>
        <button @click="cancelEditing">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import IconoEditar from './IconoEditar.vue'; 

export default {
  name: "TipoPerfil",
  components: {
    IconoEditar
  },
  props: {
    profileType: {
      type: String,
      default: "Tipo de Perfil", // Valor por defecto si no se pasa la prop
    },
    description: {
      type: String,
      default: "Aca va una breve descripcion",
    },
  },
  data() {
    return {
      isEditing: false,
      editableDescription: this.description,
    };
  },
  watch: {
    description(newVal) {
      this.editableDescription = newVal;
    }
  },
  methods: {
    startEditing() {
      this.isEditing = true;
      this.$nextTick(() => {
        this.$refs.descriptionInput.focus();
      });
    },
    saveDescription() {
      this.$emit('update-description', this.editableDescription);
      this.isEditing = false;
    },
    cancelEditing() {
      this.editableDescription = this.description;
      this.isEditing = false;
    },
  },
};
</script>

<style> /* ¡IMPORTANTE! Se agregó 'scoped' */
.tipo-perfil-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el contenido horizontalmente */
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

/* Selector corregido para el h2 y eliminación de posicionamiento absoluto */
.tipo-perfil-container h2 {
  color: #333;
  font-size: 1.8em;
  margin-bottom: 10px;
  text-align: center;
  /* Se eliminó position: absolute y top: 250px; */
}

/* Selector corregido para el h3 y eliminación de posicionamiento absoluto */
.Descripcion-editable-wrapper h3 {
  color: #555;
  font-size: 1.1em;
  text-align: center;
  max-width: 100%; /* Ajustado para que ocupe el ancho completo del wrapper */
  line-height: 1.5;
  padding-right: 30px; /* Espacio para el icono de edición */
  /* Se eliminó position: absolute; */
}

.description-textarea {
  width: calc(100% - 40px);
  min-height: 80px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1em;
  resize: vertical;
  margin-bottom: 10px;
}

.edit-description-icon-position {
  top: 0;
  right: 0;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.edit-actions button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9em;
  transition: background-color 0.3s ease;
}

.edit-actions button:first-child {
  background-color: #6a0dad;
  color: white;
}

.edit-actions button:first-child:hover {
  background-color: #5a0c9d;
}

.edit-actions button:last-child {
  background-color: #ccc;
  color: #333;
}

.edit-actions button:last-child:hover {
  background-color: #bbb;
}
</style>