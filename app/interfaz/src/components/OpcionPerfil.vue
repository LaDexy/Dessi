<template>
  <div>
    <!-- Menú desplegable para opciones de perfil -->
    <div class="MiPerfil">
      <!-- Añadimos @click para alternar la visibilidad del menú -->
      <button @click="toggleDropdown" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
        Mi Perfil
      </button>
      
      <!-- Usamos :class para controlar la visibilidad del menú con la clase 'show' -->
      <div :class="{ 'content': true, 'show': showDropdown }" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
        <router-link to="/perfil" @click="closeDropdownAndNavigate" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">
          Editar perfil
        </router-link>
        <!-- El @click llama al método logout definido en este mismo componente -->
        <div @click="logout" class="logout-button block px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer rounded-md">
          <a>Cerrar sesión</a>
        </div>
      </div>
    </div>

    <!-- Mensaje de confirmación/éxito personalizado -->
    <div v-if="showMessage" class="custom-message-box fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="message-content bg-white p-6 rounded-lg shadow-xl text-center">
        <p class="text-lg font-semibold text-gray-800 mb-4">{{ messageText }}</p>
        <button @click="closeMessage" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 ease-in-out">
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OpcionPerfil",
  data() {
    return {
      showDropdown: false, // Controla la visibilidad del menú desplegable
      showMessage: false,  // Controla la visibilidad del mensaje personalizado
      messageText: ""      // Texto del mensaje personalizado
    };
  },
  methods: {
    /**
     * @description Alterna la visibilidad del menú desplegable.
     */
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    /**
     * @description Cierra el menú desplegable.
     */
    closeDropdown() {
      this.showDropdown = false;
    },
    /**
     * @description Cierra el menú desplegable y navega.
     * Útil para asegurar que el menú se cierre al hacer clic en un enlace de navegación.
     */
    closeDropdownAndNavigate() {
      this.closeDropdown(); 
    },
    /**
     * @description Muestra un mensaje personalizado en un modal.
     * @param {string} message - El texto a mostrar en el mensaje.
     */
    showCustomMessage(message) {
      this.messageText = message;
      this.showMessage = true;
    },
    /**
     * @description Cierra el modal de mensaje personalizado y limpia el texto.
     */
    closeMessage() {
      this.showMessage = false;
      this.messageText = "";
    },
    /**
     * @description Lógica para cerrar sesión del usuario.
     * Elimina todos los datos de sesión y redirige a la página principal.
     */
    logout() {
      console.log('Intentando cerrar sesión desde OpcionPerfil...');
      // 1. Eliminar todos los datos de sesión de localStorage y sessionStorage
      localStorage.removeItem('userToken');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('userImage');

      sessionStorage.removeItem('userToken');
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('userName');
      sessionStorage.removeItem('userImage');

      console.log('Datos de sesión eliminados. Redirigiendo a la página principal...');
      this.showCustomMessage("¡Has cerrado sesión exitosamente!"); // Mostrar mensaje personalizado

      // Redirigir después de un pequeño retraso para que el usuario vea el mensaje
      setTimeout(() => {
        // **CAMBIO CLAVE AQUÍ:** Usamos el nombre de la ruta 'Principal'
        // que está definida en router/index.js para el path '/'
        this.$router.push({ name: 'Principal' }); 
        this.closeDropdown(); // Asegura que el dropdown se cierre
      }, 1000); // Retraso de 1 segundo
    }
  }
}
</script>

<style>

/* Estilos específicos para este componente */
.MiPerfil {
  position: relative; /* Necesario para posicionar el menú desplegable */
  display: inline-block;
}

.MiPerfil button {
  /* Estilos para el botón "Mi Perfil" */
  /* Ya aplicados con Tailwind en el template */
}

.content {
  display: none; /* Por defecto oculto */
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
  /* Ya aplicados con Tailwind en el template (absolute, right-0, mt-2, etc.) */
}

.content.show {
  display: block; /* Muestra el menú cuando tiene la clase 'show' */
}

.content a, .logout-button {
  /* Estilos para los enlaces y el botón de cerrar sesión dentro del menú */
  /* Ya aplicados con Tailwind en el template (block, px-4, py-2, etc.) */
  text-decoration: none;
}

.logout-button a {
  cursor: pointer; /* Indica que es clickeable */
}

/* Estilos para el mensaje personalizado (modal) */
.custom-message-box {
  /* Ya aplicados con Tailwind en el template (fixed, inset-0, bg-black, etc.) */
}

.message-content {
  /* Ya aplicados con Tailwind en el template (bg-white, p-6, rounded-lg, etc.) */
}

</style>