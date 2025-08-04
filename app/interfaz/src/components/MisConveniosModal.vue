<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Mis Convenios Aceptados</h5>
          <button type="button" class="btn-close" @click="$emit('close')" aria-label="Close"></button>
        </div>

        <div class="modal-body">
          <div v-if="isLoading" class="text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando tus convenios...</p>
          </div>
          
          <div v-else>
            <div v-if="convenios.length === 0" class="text-center">
              <p>No tienes convenios aceptados actualmente.</p>
            </div>

            <div v-else class="list-group">
              <div v-for="convenio in convenios" :key="convenio.id_convenio" class="list-group-item list-group-item-action mb-2">
                <div class="d-flex w-100 justify-content-between">
                  <h5 class="mb-1">{{ convenio.nombre_socio }}</h5>
                  <small>{{ convenio.estado }}</small>
                </div>
                <p class="mb-1">
                  <strong>Fecha de Convenio:</strong> {{ formatDate(convenio.fecha_creacion) }}
                </p>
                <div class="info-contacto">
                  <small class="d-block">
                    <i class="fa-solid fa-envelope"></i> {{ convenio.email_socio }}
                  </small>
                  <small class="d-block">
                    <i class="fa-solid fa-phone"></i> {{ convenio.telefono_socio }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="$emit('close')">Cerrar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MisConveniosModal',
  props: {
    show: {
      type: Boolean,
      required: true,
    },
    convenios: {
      type: Array,
      default: () => [],
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('es-ES', options);
    },
  },
};
</script>

<style scoped>

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
  z-index: 1050; 
  overflow-y: auto;
}


.modal-content {
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 100%;
}


.modal-header {
  border-bottom: 1px solid #dee2e6;
  background-color: #e9ecef;
  color: #343a40;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  padding: 1rem;
}


.modal-body {
  padding: 1.5rem;
}


.list-group-item {
  background-color: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
}

.list-group-item:hover {
  background-color: #f1f3f5;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.info-contacto small {
  color: #6c757d;
  font-size: 0.9rem;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem;
  background-color: #e9ecef;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}
</style>