/*Importacion de las paginas principales*/

import { createRouter, createWebHistory } from 'vue-router';
import PaginaPrincipal from '../Vistas/PaginaPrincipal.vue';
import PaginaCentral from '../Vistas/PaginaCentral.vue';
import PaginaPerfil from '@/Vistas/PaginaPerfil.vue';
import PaginaForo from '@/Vistas/PaginaForo.vue';
const routes = [
  {
    path: '/',
    name: 'Principal', 
    component: PaginaPrincipal
  },
  {
    path: '/central',
    name: 'Central', 
    component: PaginaCentral
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: PaginaPerfil
  },
  {
    path: '/foro',
    name: 'Foro',
    component: PaginaForo
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;