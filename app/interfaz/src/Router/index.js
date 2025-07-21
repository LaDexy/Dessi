/*Importacion de las paginas principales*/
import { createRouter, createWebHistory } from 'vue-router';
import PaginaPrincipal from '../Vistas/PaginaPrincipal.vue';
import PaginaCentral from '../Vistas/PaginaCentral.vue';
import PaginaPerfil from '@/Vistas/PaginaPerfil.vue';
import PaginaForo from '@/Vistas/PaginaForo.vue';
import ForoInteraccion from '@/components/ForoInteraccion.vue';


const routes = [
  {
    path: '/',
    name: 'Principal',
    component: PaginaPrincipal
  },
  { // Agrega esta nueva ruta para /login
    path: '/login',
    name: 'Login', // Puedes darle un nombre específico si lo deseas
    component: PaginaPrincipal // O tu componente de Login/Registro si es diferente
  },
  
  {
    path: '/central',
    name: 'Central',
    component: PaginaCentral,
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: PaginaPerfil,
    meta: { requiresAuth: true }
  },
  {
    path: '/foro',
    name: 'Foro',
    component: PaginaForo,
    meta: { requiresAuth: true }
  },
   {
    // NUEVA RUTA para el detalle de un tema específico
    path: '/foro/:id', // :id es un parámetro dinámico que capturará el ID del tema
    name: 'ThreadDetail', // Este es el nombre que usarás en router.push de ForoUsuarios.vue
    component: ForoInteraccion, // <--- Carga ForoInteraccion.vue para mostrar el detalle del tema
    props: true, // Importante: Esto pasa el 'id' de la URL como una prop al componente ForoInteraccion
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación global (sin cambios aquí, ya que redirige a 'Principal')
router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  if (to.meta.requiresAuth) {
    if (userToken) {
      next();
    } else {
      console.warn('Acceso denegado: Ruta protegida sin autenticación. Redirigiendo a Principal.');
      // Si realmente quieres que vaya a /login cuando no esté autenticado, cámbialo aquí:
      // next({ name: 'Login' }); // Redirige al nombre 'Login'
      next({ name: 'Principal' }); // Esto sigue siendo válido si Principal es tu login
    }
  } else {
    if (userToken && (to.name === 'Principal' || to.name === 'Login')) { // Ajusta aquí si añades 'Login'
      console.log('Usuario ya autenticado. Redirigiendo a Central.');
      next({ name: 'Central' });
    } else {
      next();
    }
  }
});

export default router;