// Requires
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
// Inicializar variables
const app = express();

//body Parser
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended:false}))
// parse application/json 
app.use(bodyParser.json())

/* El body parser toma los datos y lo transforma en un objeto de javascript para que lo podamos usar en cualquier lugar*/

// importar rutas
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const busquedaRoutes = require('./routes/busqueda');
const uploadRoutes = require('./routes/upload');
const imagenesRoutes = require('./routes/imagenes');

// Conexión a la base de datos

mongoose.connection.openUri(
  "mongodb://localhost:27017/hospitalDB",
  (err, res) => {
    if (err) throw err;
    console.log('Base de datos :\x1b[32m%s\x1b[0m', 'online');
  }
);

//Rutas
// middlwares
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


app.listen(3000, () => {
  console.log("Express Server puerto 3000: \x1b[32m%s\x1b[0m", "online");
});
