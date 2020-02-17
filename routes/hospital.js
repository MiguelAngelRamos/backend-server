const express = require("express");
const mdAutenticacion = require("../middlewares/autenticacion");
const app = express();
const Hospital = require("../models/hospital");

// get Obtener todos los hospitales
app.get("/", (req, res) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);

  Hospital.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email')
  .exec((err, hospitalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "Error al cargar hospital",
        error: err
      });
    }
    Hospital.count({}, (err, contadorHospital)=>{
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "Error al contar hospitales",
          error: err
        });
      }
      res.status(200).json({
        ok: true,
        hospitales: hospitalDB,
        total: contadorHospital
      });
    })
  });
});

// put Actualizar un Hospital
app.put("/:id", mdAutenticacion.verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;
  Hospital.findById(id, (err, hospitalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "error la buscar hospital"
      });
    }

    if (!hospitalDB) {
      return res.status(400).json({
        ok: false,
        message: "El Hospital con el id" + id + "no existe..",
        errors: { message: "No existe un hospital con ese ID" }
      });
    }

    hospitalDB.nombre = body.nombre;
    hospitalDB.usuario = req.usuario._id;

    // guardamos el nuevo hospital
    hospitalDB.save((err, hospitalGuardado) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          message: "Error al actualizar hospital",
          errors: err
        });
      }
      res.status(200).json({
        ok: true,
        hospital: hospitalGuardado
      });
    });
  });
});

// pot Crear un nuevo Hospital
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  let body = req.body;

  let hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear un hospital en la BD",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      hospital: hospitalGuardado,
    });
  });
});

// delete borrar un hospital por el id

app.delete("/:id", mdAutenticacion.verificaToken, (req, res) => {

  let id = req.params.id;

  Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar Hospital",
        errors: err
      });
    }

    if (!hospitalBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un hospital con ese id",
        errors: { message: 'No existe ningun hospital con ese id'}
      });
    }
    res.status(200).json({
      ok: true,
      hospital: hospitalBorrado
    });
  });
});

module.exports = app;
