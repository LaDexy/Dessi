<template>
  <div>
    <!--ESTA ES LA PARTE DE LOS BOTONES DENTRO DE PAGINA CENTRAL PARA ENTRAR A EDITAR PERFIL O CERRAR SESION -->
    <div class="MiPerfil">
      <button @click="toggleDropdown" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out">
        Mi Perfil
      </button>
      
      <div :class="{ 'content': true, 'show': showDropdown }" class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
        <router-link to="/perfil" @click="closeDropdownAndNavigate" class="block px-4 py-2 text-gray-800 hover:bg-gray-100 rounded-md">
          Editar perfil
        </router-link>
        <div @click="logout" class="logout-button block px-4 py-2 text-red-600 hover:bg-red-50 cursor-pointer rounded-md">
          <a>Cerrar sesión</a>
        </div>
      </div>
    </div>

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
      showDropdown: false,
      showMessage: false,
      messageText: ""
    };
  },
  methods: {
    toggleDropdown() {
      this.showDropdown = !this.showDropdown;
    },
    closeDropdown() {
      this.showDropdown = false;
    },
    closeDropdownAndNavigate() {
      this.closeDropdown(); 
    },
    showCustomMessage(message) {
      this.messageText = message;
      this.showMessage = true;
    },
    closeMessage() {
      this.showMessage = false;
      this.messageText = "";
    },
    logout() {
      console.log('Intentando cerrar sesión desde OpcionPerfil...');
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
      this.showCustomMessage("¡Has cerrado sesión exitosamente!");

      setTimeout(() => {
        this.$router.push({ name: 'Principal' }); 
        this.closeDropdown();
      }, 1000);
    }
  }
}
</script>

<style>
.MiPerfil {
  left: 75%;
  position: relative;
  display: inline-block;
}

.content {
  display: none;
  min-width: 160px;
  box-shadow: 0px 8px 16px 0px #D8BFD8;
}

.content.show {
  display: block;
}

.content a, .logout-button {
  text-decoration: none;
}

.logout-button a {
  cursor: pointer;
}
</style>