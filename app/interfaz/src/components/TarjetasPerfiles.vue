<template>
  <div>
    <!--Primera tarjeta-->
    <div class="Exterior">
      <article class="Tarjeta">
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
      </article>

     
    </div>
    <!--Segunda tarjeta-->

<div class="Exterior">
      <article class="Tarjeta">
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
      </article>
    </div>


      <!--Tercera tarjeta-->

      <div class="Exterior">
      <article class="Tarjeta">
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
      </article>
    </div>

  </div>
</template>

<script>
export default {
  name: "TarjetasPerfiles",
};
</script>

<style>

/*Imagen*/

img {

max-width: 100%;

}

/*Tarjeta*/
article.Tarjeta{

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
