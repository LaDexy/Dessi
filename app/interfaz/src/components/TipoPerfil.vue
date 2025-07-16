<template>

 <div class="tipo-perfil-container">
    <div class="TipoPerfil"><h2>{{ profileType }}</h2></div>

    <div class="Descripcion-editable-wrapper">
      <h3 v-if="!isEditingDescription">{{ description }}</h3>
      <textarea
        v-else
        v-model="editedDescription"
        @blur="saveDescription"  @keyup.enter="saveDescription" class="description-textarea"
      ></textarea>

      <IconoEditar @click="toggleEditMode" class="edit-description-icon" />

      <div v-if="isEditingDescription" class="edit-actions">
        <button @click="saveDescription">Guardar</button>
        <button @click="cancelEdit">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<script>
import IconoEditar from '@/components/IconoEditar.vue'; // Asegúrate de la ruta correcta

export default {
  name: "TipoPerfil",
  components: {
    IconoEditar
  },
  props: {
    profileType: {
      type: String,
      default: 'Tipo de Perfil'
    },
    description: { // La descripción inicial que viene de PaginaPerfil
      type: String,
      default: 'Aca va una breve descripcion'
    }
  },
  data() {
    return {
      isEditingDescription: false, // Controla si estamos en modo edición
      editedDescription: this.description // Una copia editable de la descripción
    };
  },
  watch: {
    // Observa si la prop 'description' cambia desde el padre
    // Esto es importante si la descripción se carga async o se actualiza externamente
    description(newVal) {
      this.editedDescription = newVal;
    }
  },
  methods: {
    toggleEditMode() {
      // Si entramos en modo edición, aseguramos que editedDescription tenga el valor actual
      if (!this.isEditingDescription) {
        this.editedDescription = this.description;
      }
      this.isEditingDescription = !this.isEditingDescription;
    },
    saveDescription() {
      // Solo guardamos si el texto realmente ha cambiado
      if (this.editedDescription.trim() !== this.description.trim()) {
        // Emitimos un evento al componente padre (PaginaPerfil)
        // para que sea él quien maneje la actualización con el backend.
        this.$emit('update-description', this.editedDescription.trim());
      }
      this.isEditingDescription = false; // Salimos del modo edición
    },
    cancelEdit() {
      this.editedDescription = this.description; // Revertimos los cambios
      this.isEditingDescription = false; // Salimos del modo edición
    }
  }
};
</script>


<style>
.tipo-perfil-container {

  display: flex;
  flex-direction: column;
  align-items: center; /* Centra el texto horizontalmente */
  width: 100%;
  margin-top: 20px; /* Espacio entre la BarraPerfil y este componente */
  margin-bottom: 20px; /* Espacio debajo de este componente */
}

.TipoPerfil h2 {
    position: absolute;
    top: 250px;
  color: #333; /* Color oscuro para el texto */
  font-size: 1.8em;
  margin-bottom: 10px;
  text-align: center;
}

.Descripcion h3 {
    position: absolute;
  color: #555; /* Color ligeramente más claro para la descripción */
  font-size: 1.1em;
  text-align: center;
  max-width: 80%; /* Limita el ancho del texto para mejor lectura */
  line-height: 1.5;
}
</style>