<template>
  <div class="notification-icon-wrapper" @click="handleClick">
    <i class="fas fa-bell notification-bell-icon"></i>
    <span v-if="count > 0" class="notification-badge">{{ count }}</span>
  </div>
</template>

<script>
export default {
  name: 'IconoNotificaciones',
  props: {
    count: {
      type: Number,
      default: 0
    }
  },
  methods: {
    handleClick() {
      
      this.$emit('click'); 
    }
  }
}
</script>

<style scoped>
.notification-icon-wrapper {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 50px; 
  height: 50px; 
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 999; 
  background-color: #d9bad9; 
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease-in-out;
}

.notification-icon-wrapper:hover {
  transform: scale(1.05);
}

.notification-bell-icon {
  font-size: 2.2em; 
  color: #5e1c7d; 
}

.notification-badge {
  position: absolute;
  top: 5px; 
  right: 5px; 
  background-color: #ef5350; 
  color: white;
  border-radius: 50%; 
  padding: 4px 8px; 
  font-size: 0.8em; 
  font-weight: bold;
  min-width: 20px; 
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  transform: scale(1);
  animation: bounceIn 0.5s ease-out;
}

@keyframes bounceIn {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); }
}

@media (max-width: 600px) {
  .notification-icon-wrapper {
    width: 40px;
    height: 40px;
    top: 15px;
    right: 15px;
  }
  .notification-bell-icon {
    font-size: 1.8em;
  }
  .notification-badge {
    padding: 3px 6px;
    font-size: 0.7em;
    min-width: 18px;
    height: 18px;
    top: 3px;
    right: 3px;
  }
}
</style>