const express = require('express');
const app= express();
const path = require('path'); // me va ayudar a construir el path sin errores 
const fs = require('fs'); // file system nos permite crear archivo, moverlos y verificar si el path es valido

app.get("/:tipo/:img", (req, res) => {
  const tipo = req.params.tipo;
  const img = req.params.img;

  // verificar si la imagen existe sino existe mostramos una imagen por defecto
  const pathImagen = path.resolve(__dirname, `../uploads/${tipo}/${img}`); // con ___dirname obtengo toda la ruta en donde me encuentro en ese momento no importa
  // si esta en produccion o desarrollo y el siguiente argumento es otra parte que quiero concatenerle al url
  if(fs.existsSync(pathImagen)){
    // el res.sendfile con f minuscula esta depreciado obsoleto
    res.sendFile(pathImagen);
  } else {
    const pathNoImagen = path.resolve(__dirname, '../assets/no-img.jpg');
    res.sendFile(pathNoImagen);
  }
});

module.exports = app;