<template>

  <!--ESTO ES LA PARTE QUE TIENE EL TIPO DE PERFIL DE LOS USUARIOS Y LA PARTE PARA LA DESCRIPCION-->
  <div class="tipo-perfil-container">
    <h2>{{ profileType }}</h2>
    <div class="Descripcion-editable-wrapper">
      <h3 v-if="!isEditing">
        {{ description || 'Escribe una descripcion para tu perfil' }}
      </h3>
      <textarea
        v-else
        v-model="editableDescription"
        class="description-textarea"
        ref="descriptionInput"
      ></textarea>

      <div class="CambioDescripcion">
        <IconoEditar v-if="!isEditing" @click="startEditing" class="edit-description-icon-position" />
      </div>

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
      default: "Tipo de Perfil",
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

<style scoped>
.CambioDescripcion {
  position: relative;
}

.tipo-perfil-container {
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.tipo-perfil-container h2 {
  color: #6a1b9a;
  font-size: 1.8em;
  margin-bottom: 10px;
  text-align: center;
  align-items: center;
}

.Descripcion-editable-wrapper h3 {
  color: #555;
  font-size: 1.5em;
  text-align: center;
  max-width: 100%;
  line-height: 1.1;
  padding-right: 30px;
  align-items: center;
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
  align-items: center;
}

.edit-description-icon-position {
  top: 0;
  right: 0;
  align-items: center;
}

.edit-actions {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  align-items: center;
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
  background-color: hsl(300, 29%, 78%);
  color: white;
}

.edit-actions button:first-child:hover {
  background-color: hsl(300, 29%, 78%);
}

.edit-actions button:last-child {
  background-color: #ccc;
  color: #333;
}

.edit-actions button:last-child:hover {
  background-color: #bbb;
}
</style>