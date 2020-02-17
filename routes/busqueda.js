const express = require("express");
const app = express();

const Hospital = require("../models/hospital");
const Medico = require("../models/medico");
const Usuario = require("../models/usuario");
// ========================================
// Busqueda por coleccion
// ========================================

app.get('/coleccion/:tabla/:busqueda', (req, res)=>{
  const busqueda = req.params.busqueda;
  const tabla = req.params.tabla;
  const regex = new RegExp(busqueda, 'i');

  let promesa; // sera la promesa que deseo ejecutar
  // para las decisiones
  switch(tabla){
    case 'usuarios':
      promesa = buscarUsuarios(busqueda, regex);
      break;
    case 'medicos':
      promesa = buscarMedicos(busqueda, regex);
      break;
    case 'hospitales':
      promesa = buscarHospitales(busqueda, regex);
      break;
    default:
      return res.status(400).json({ // error 400 bad request
        ok:false,
        message: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
        error: { message: 'Tipo de tabla/coleccion no válido'}
      });
  }
  // si me mandan algo correcto no se ejecuta el default y tengo el then de la promesabundleRenderer.renderToStream
  promesa.then( data=>{
    res.status(200).json({
      ok:true,
      [tabla]:data // propiedades de objeto computadas o procesadas, le digo a js que no es la palabra tabla sino es el resultado de lo que tenga esa variable

    })
  })
});

// ========================================
// Busqueda General
// ========================================

app.get("/todo/:busqueda", (req, res) => {
  const busqueda = req.params.busqueda;
  // que busque cualquier pertenencia
  const regex = new RegExp(busqueda, "i"); // la 'i' es insensible a mayusculas y miniculas

  // Promise all arregelo de promesas si todas se cumplen then y si todas fallan el catch
  Promise.all([
    buscarHospitales(busqueda, regex),
    buscarMedicos(busqueda, regex),
    buscarUsuarios(busqueda, regex)
  ]).then(respuestas => {
    res.status(200).json({
      ok: true,
      mensaje: "Petición realizada correctamente",
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2]
    });
  });
});

function buscarHospitales(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate("usuario", "nombre email")
      .exec((err, hospitales) => {
        if (err) {
          reject("Error al cargar hospitales", err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
    .populate('usuario', 'nombre email')
    .populate('hospital')
    .exec(
      (err, medicos) => {
        if (err) {
          reject("Error al cargar medicoes", err);
        } else {
          resolve(medicos);
        }
      })
  });
}


// buscar en 2 columnas simultaneamente esdecir buscar por nombre y email simultaneamente

function buscarUsuarios(busqueda, regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, "nombre email role")
      .or([{ nombre: regex }, { email: regex }]) // buscando en dos lados
      .exec((err, usuarios) => {
        if (err) {
          reject("Error al cargar usuarios", err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
