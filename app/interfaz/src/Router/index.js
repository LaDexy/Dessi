/*Importacion de las paginas principales*/

import { createRouter, createWebHistory } from 'vue-router';
import PaginaPrincipal from '../Vistas/PaginaPrincipal.vue';
import PaginaCentral from '../Vistas/PaginaCentral.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;