/*Importacion del vue*/
import { createApp } from 'vue';
import App from './App.vue';

// Importacion para pagina de tipografia e iconos
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/js/all.js';

// Importacion para Bootstrap
import 'bootstrap'; 
import 'bootstrap/dist/css/bootstrap.css';

// Importacion para el router
import router from './Router'; 

const app = createApp(App); 
app.use(router);            
app.mount('#app');          
