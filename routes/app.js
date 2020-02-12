const express = require('express');
const app= express();
// Ruta son 3 los parametros que se usan en ese callback req, res, next, normalmente en get put update etc no se usa next, sino cuando trabajamos con middlwares
app.get("/", (req, res) => {
  res.status(200).json({
    ok: true,
    mensaje: "Petición realizada correctamente"
  });
});

module.exports = app;