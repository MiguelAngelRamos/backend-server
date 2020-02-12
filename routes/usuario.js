const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const mdAutenticacion = require('../middlewares/autenticacion');
const app = express();
const Usuario = require("../models/usuario");

//================================
// Obtener todos los usuarios
//================================
app.get("/", (req, res) => {
  Usuario.find({}, "nombre email img role").exec((err, usuarios) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "Error cargando usuario...",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      usuarios: usuarios
    });
  });
});

// este middlware bloquea todas las rutas que vengan despues de el solo con la funcion next a las otras rutas si es que el token, llega a ser valido
//================================
// Actualizar  Usuario
//================================

app.put("/:id",  mdAutenticacion.verificaToken, (req, res) => {
  let id = req.params.id;
  let body = req.body;

  Usuario.findById(id, (err, usuario) => {
    
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "Error al buscar usuario...",
        errors: err
      }); // error 500 por que un usuario findbyId si no existe deberia retornar un usuario vacio no un error, por eso el error es 500,
      // por que si sucede es del servidor.
    }

    if (!usuario) {
      return res.status(400).json({
        ok: false,
        message: 'El usuario con el id' + id + 'no existe...',
        errors: {message: 'No existe un usuario con ese ID'}
      });
    }

    // SINO ENTRA A NINGUNO DE LOS IF QUIERE DECIR QUE SI EXISTE EL USUARIO Y ESTAMOS LISTOS PARA ACTUALIZAR LA DATA

    usuario.nombre = body.nombre;
    usuario.email = body.email;
    usuario.role = body.role;
    //grabacion
    usuario.save((err, usuarioGuardado)=>{

      if(err){
        return res.status(500).json({
          ok: false,
          message: "Error al actualizar usuario",
          errors: err
        }); 
      }
      usuarioGuardado.password = ':)';
      res.status(200).json({
        ok:true,
        usuario:usuarioGuardado
      });
    });
  });
});

//================================
// Crear un nuevo Usuario
//================================
app.post("/", mdAutenticacion.verificaToken, (req, res) => {
  let body = req.body;
  let usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioGuardado) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al crear usuario en la BD",
        errors: err
      });
    }
    res.status(201).json({
      ok: true,
      usuario: usuarioGuardado,
      usuariotoken: req.usuario
    });
  });
});

//================================
// Borrar un usuario por el id
//================================

app.delete('/:id',  mdAutenticacion.verificaToken, (req, res)=>{
  let id = req.params.id;
  // borrar usuario
  Usuario.findByIdAndRemove(id, (err, usuarioBorrado)=>{

    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: "Error al borrar usuario",
        errors: err
      });
    }

    if (!usuarioBorrado) {
      return res.status(400).json({
        ok: false,
        mensaje: "No existe un usuario con ese id",
        errors: err
      });
    }
    res.status(200).json({
      ok: true,
      usuario: usuarioBorrado
    });
  })
});
module.exports = app;
