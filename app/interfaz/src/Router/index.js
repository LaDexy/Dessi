
import { createRouter, createWebHistory } from 'vue-router';
import PaginaPrincipal from '../Vistas/PaginaPrincipal.vue';
import PaginaCentral from '../Vistas/PaginaCentral.vue';
import PaginaPerfil from '@/Vistas/PaginaPerfil.vue';
import PaginaForo from '@/Vistas/PaginaForo.vue';
import ForoInteraccion from '@/components/ForoInteraccion.vue';
import PaginaNotificaciones from '@/Vistas/PaginaNotificaciones.vue';
import PaginaDesafios from '@/Vistas/PaginaDesafios.vue';
import PaginaDetalleDesafio from '@/Vistas/PaginaDetalleDesafio.vue';


const routes = [
  {
    path: '/',
    name: 'Principal',
    component: PaginaPrincipal
  },
  {
    path: '/login',
    name: 'Login', 
    component: PaginaPrincipal 
  },
  
  {
    path: '/central',
    name: 'Central',
    component: PaginaCentral,
    meta: { requiresAuth: true }
  },
   {
    path: '/desafiosActivos',
    name: 'desafiosActivos',
    component: PaginaDesafios,
    meta: { requiresAuth: true }
  },
  {
    path:  '/desafios/:id',
    name: 'PaginaDetalleDesafio',
    component: PaginaDetalleDesafio,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: PaginaPerfil,
    meta: { requiresAuth: true }
  },
  {
    path: '/notificaciones',
    name: 'Notificaciones',
    component: PaginaNotificaciones,
    meta: { requiresAuth: true }
  },
  {
    path: '/foro',
    name: 'Foro',
    component: PaginaForo,
    meta: { requiresAuth: true }
  },
   {
    
    path: '/foro/:id',
    name: 'ThreadDetail', 
    component: ForoInteraccion, 
    props: true, 
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});


router.beforeEach((to, from, next) => {
  const userToken = localStorage.getItem('userToken') || sessionStorage.getItem('userToken');

  if (to.meta.requiresAuth) {
    if (userToken) {
      next();
    } else {
      console.warn('Acceso denegado: Ruta protegida sin autenticación. Redirigiendo a Principal.');
      
      next({ name: 'Principal' }); 
    }
  } else {
    if (userToken && (to.name === 'Principal' || to.name === 'Login')) { 
      console.log('Usuario ya autenticado. Redirigiendo a Central.');
      next({ name: 'Central' });
    } else {
      next();
    }
  }
});

export default router;