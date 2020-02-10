// Requires
const express = require("express");
const mongoose = require("mongoose");
// Inicializar variables
const app = express();
// Escuchar peticiones

// Conexión a la base de datos

mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (err, res) => {
    if (err) throw err;
    console.log('Base de datos :\x1b[32m%s\x1b[0m', 'online');
  }
);
// Ruta son 3 los parametros que se usan en ese callback req, res, next, normalmente en get put update etc no se usa next, sino cuando trabajamos con middlwares
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Petición realizada correctamente"
  });
});

app.listen(3000, () => {
  console.log("Express Server puerto 3000: \x1b[32m%s\x1b[0m", "online");
});
