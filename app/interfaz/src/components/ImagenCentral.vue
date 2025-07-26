<template>
<div>

  <!--ESTA ES LA PARTE DE LA IMAGEN QUE AL PASAR EL MOUSE SALE EL CHEKLIST DE PAGINA PRINCIPAL-->
    <article>
        <img src="../assets/Persona.png" alt="...">
        <img src="../assets/si.png" alt="...">
    </article>
</div>
</template>

<script>
export default{
    name: "ImagenCetral"
}
</script>

<style>
article{
position: relative;
width: 350px;
transition: all .3s ease;
margin: 30px auto;
z-index: 2;
height: auto;
display: block;
}

article img:first-child{
box-shadow: 0 60px 60px
-60px rgba(240, 239, 239, 0);
border-radius: 4px;
object-fit: cover;
width: 100%;
background-color: rgb(253, 253, 253);
color: rgb(255, 255, 255);
}

article img:last-child{
position: absolute;
width: 180px;
max-width: 50%;
bottom: 0;
left: 0;
right: 0;
margin: auto;
transform: translateY(20%);
transition: .3s ease;
opacity: 0;
}

article:hover{
transform:
perspective(250px)
rotateX(10deg)
translateY(-5%)
translateZ(0);
}

article:before{
content: '';
position: absolute;
bottom: 0;
height: 100%;
width: 100%;
background-image:
linear-gradient(
  to bottom,
  transparent 10%,
  rgba(0,0,0,0.5) 50%,
  rgb(255, 255, 255) 95%
);
opacity: 0;
transition: all .3s ease;
}

article:hover::before{
opacity: 1;
}

article:hover img:last-child{
opacity: 1;
transform: translateY(10%);
}

@media (max-width: 768px) {
  article {
    width: 280px;
    margin-top: 25px;
  }

  article img:first-child {
    border-radius: 10px;
  }

  article img:last-child {
    width: 150px;
    padding: 12px;
  }
}

@media (max-width: 480px) {
  article {
    width: 240px;
    margin-top: 20px;
  }

  article img:first-child {
    border-radius: 8px;
  }

  article img:last-child {
    width: 120px;
    padding: 10px;
  }

}

@media (max-width: 350px) {
  article {
    width: 100%;
    max-width: 95%;
  }
}
</style>