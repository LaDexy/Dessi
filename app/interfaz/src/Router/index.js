/*Importacion de las paginas principales*/
import { createRouter, createWebHistory } from 'vue-router';
import PaginaPrincipal from '../Vistas/PaginaPrincipal.vue';
import PaginaCentral from '../Vistas/PaginaCentral.vue';
import PaginaPerfil from '@/Vistas/PaginaPerfil.vue';
import PaginaForo from '@/Vistas/PaginaForo.vue';


const routes = [
  {
    path: '/', // La ruta raíz será para la página de inicio (no autenticada)
    name: 'Principal',
    component: PaginaPrincipal
  },
  {
    path: '/central', // Esta es la ruta para la página central (dashboard)
    name: 'Central',
    component: PaginaCentral,
    meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/perfil', // Ruta para la página de perfil del usuario
    name: 'Perfil',
    component: PaginaPerfil,
    meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  {
    path: '/foro', // Ruta para la página del foro
    name: 'Foro',
    component: PaginaForo,
    meta: { requiresAuth: true } // Esta ruta requiere autenticación
  },
  
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación global para proteger rutas
router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  // Si la ruta a la que se intenta acceder requiere autenticación
  if (to.meta.requiresAuth) {
    if (userToken) {
      // Si el usuario está autenticado, permite el acceso a la ruta
      next();
    } else {
      // Si no está autenticado, redirige a la página principal (login/registro)
      console.warn('Acceso denegado: Ruta protegida sin autenticación. Redirigiendo a Principal.');
      next({ name: 'Principal' }); // Redirige por nombre de ruta
    }
  } else {
    // Si la ruta NO requiere autenticación (como la página principal '/')
    // y el usuario YA está autenticado, redirige a la página central
    if (userToken && to.name === 'Principal') {
      console.log('Usuario ya autenticado. Redirigiendo a Central.');
      next({ name: 'Central' });
    } else {
      // Si la ruta no requiere autenticación y el usuario no está autenticado (o ya está en otra ruta no protegida), permite el acceso
      next();
    }
  }
});

export default router;