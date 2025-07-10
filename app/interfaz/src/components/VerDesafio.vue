<template>

<div>

     <!-- Boton de ver desafios -->
    <div class="VerDesafios" id="VerDesafios">
        <div>
            <h2>Desafíos Creados</h2>
            <div>
                <!-- Challenges will be loaded here -->
                <p>No hay desafíos creados aún.</p>
            </div>
            <div>
                <button class="CerrarDesafio" type="button" id="closeViewBtn" @click="$emit('cerrar')">
                    Cerrar
                </button>
            </div>
        </div>
    </div>

<!-- Caja donde se veran los desafios -->
    <div id="CajaDesafios">
        <p id="CajaDesafios"></p>
    </div>

</div>

</template>

<script>

export default{

    name: "VerDesafio"

}

</script>

<style>

.VerDesafios {
  position: absolute;
  left: 530px;
  top: 250px;
  padding: 40px;
  font-family: "Times New Roman", serif;
  width: 450px;
  height: 160px;
  background: white;
  border: 5px solid rgba(0, 0, 0, 0.5);
  border-radius: 100px;
  backdrop-filter: blur(20px);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  opacity: 0.9;
}

.CerrarDesafio {
  width: 100%;
  height: 30px;
  background: #440857;
  border: none;
  outline: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1em;
  color: #fff;
  font-weight: 500;
}


</style>