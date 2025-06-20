import express from "express";

//Para el llamado de las rutas
import path from 'path';
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

//Creacion de servidor
const app = express();
app.set("port",4000);
app.listen(app.get("port"));
console.log("Servidor ejecutando en puerto",app.get("port"));

//Ruta de prueba
app.get('/test', (req,res) => {
    res.send('Holaaaaaa');
});

