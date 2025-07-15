/*Importacion de las paginas principales*/
import { createRouter, createWebHistory } from 'vue-router';
import PaginaPrincipal from '../Vistas/PaginaPrincipal.vue';
import PaginaCentral from '../Vistas/PaginaCentral.vue';
import PaginaPerfil from '@/Vistas/PaginaPerfil.vue';
import PaginaForo from '@/Vistas/PaginaForo.vue';


const routes = [
  {
    path: '/',
    name: 'Principal', // Nombre para la ruta de la página principal
    component: PaginaPrincipal
  },
  {
    path: '/central', // Ruta para la página central (dashboard)
    name: 'Central',
    component: PaginaCentral,
    meta: { requiresAuth: true } // ¡NUEVO! Esta ruta requiere autenticación
  },
  {
    path: '/perfil', // Ruta para la página de perfil del usuario
    name: 'Perfil',
    component: PaginaPerfil,
    meta: { requiresAuth: true } // ¡NUEVO! Esta ruta requiere autenticación
  },
  {
    path: '/foro', // Ruta para la página del foro
    name: 'Foro',
    component: PaginaForo,
    meta: { requiresAuth: true } // ¡NUEVO! Esta ruta requiere autenticación
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// ¡NUEVO! Guardia de navegación global para proteger rutas
router.beforeEach((to, from, next) => {
  // Verifica si la ruta a la que se intenta acceder requiere autenticación
  if (to.meta.requiresAuth) {
    // Comprueba si existe un token de usuario en localStorage o sessionStorage
    const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
    if (userToken) {
      // Si el usuario está autenticado, permite el acceso a la ruta
      next();
    } else {
      // Si no está autenticado, redirige a la página principal (Home)
      console.warn('Acceso denegado: Ruta protegida sin autenticación. Redirigiendo a Principal.');
      next({ name: 'Principal' }); // Redirige por nombre de ruta
    }
  } else {
    // Si la ruta no requiere autenticación, permite el acceso
    next();
  }
});

export default router;