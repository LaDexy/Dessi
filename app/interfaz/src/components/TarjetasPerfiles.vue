<template>
  <div>

    <div class="TarjetasPerfiles">
    <!--Primera tarjeta-->
    <div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>

           <button class="Interes">Solicitud</button>
        </footer>
      </div>

     
    </div>
    <!--Segunda tarjeta-->

<div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>
          <button class="Interes">Solicitud</button>
        </footer>
      </div>
    </div>


      <!--Tercera tarjeta-->

      <div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>
          <button class="Interes">Solicitud</button>
        </footer>
      </div>
    </div>

    <!--Cuarta tarjeta-->

      <div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>
          <button class="Interes">Solicitud</button>
        </footer>
      </div>
    </div>

    <!--Quinta tarjeta-->

      <div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>
          <button class="Interes">Solicitud</button>
        </footer>
      </div>
    </div>

    <!--Sesta tarjeta-->

      <div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>
          <button class="Interes">Solicitud</button>
        </footer>
      </div>
    </div>

    <!--Septima tarjeta-->

      <div class="Exterior">
      <div class="Tarjeta">
        <header class="Inicio-Tarjeta">
          <img src="../assets/Perfil.png" alt="" />
        </header>

        <footer class="Final-Tarjeta">
          <div class="Categoria-Tarjeta">
            <span>Nombre de usuario</span>
          </div>

          <div class="Texto-Tarjeta">
            <h3>Profesion</h3>
          </div>
          <button class="Interes">Solicitud</button>
        </footer>
      </div>
    </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "TarjetasPerfiles",
};
</script>

<style>

/*Todos los perfiles*/

.TarjetasPerfiles{

   display: flex;
  flex-wrap: wrap; /* Permite que los elementos pasen a la siguiente fila */
  justify-content: center; /* Centra los elementos horizontalmente */
  gap: 20px; /* Espacio entre las tarjetas (ajusta a tu gusto) */
  padding: 20px; /* Espacio interno del contenedor padre */
  
}


/*Imagen*/

img {

max-width: 100%;

}

/*Tarjeta*/
.Tarjeta{

position: relative;
max-width: 100%;
border-radius: 8px;
margin: 1rem;
box-shadow: 0 0 12px #d7d7d7;

}

/*El encabezado de la tarjeta*/

.Inicio-Tarjeta img{

border-radius: 8px 8px 0 0;
max-height: 200px;
height: 200px;
width: 100%;

}

/*Nombre de usuario*/

.Categoria-Tarjeta{

margin-top: 1rem;

}

/*Boton de solicitud*/

.Interes{

background-color: rgb(162, 162, 250);
border-radius: 50px;
padding: .2rem .5rem;

}

/*Parte externa de tarjeta*/

.Tarjeta footer{

padding: 0 1rem;

}

/*Ajuste de tarjetas*/

.Exterior{

display: flex;
flex-flow: wrap;

}

</style>
