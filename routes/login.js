const express = require('express');
const bycrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
const app = express();

const Usuario = require('../models/usuario');


app.post('/', (req, res)=>{
  let body = req.body;

  // verificiar si existe un usuario con ese correo electronico
  Usuario.findOne({ email: body.email}, (err, usuarioDB)=>{

    if(err){
      // aca si es un error 500 deberia mandarnos algo un usuario vacio  si es que llega aca es un error 500 es un error serio de servidor
      return res.status(500).json({
        ok:false,
        message: 'Error al buscar usuario',
        errors: err
      })
    }
    if( !usuarioDB){
      return res.status(400).json({
        ok:false,
        message:'Credenciales incorrectas - email',
        errors:err
      })
    }
    // tenemos un usuario que puso su correo electronico valido
    if(!bycrypt.compareSync(body.password, usuarioDB.password)){
      // esto va regresar un valor boleano true si lo hace correcto y false si es incorrecto
      return res.status(400).json({
        ok:false,
        message:'Credenciales incorrectas - password',
        errors:err
        // ojo que cuando este en produccion debo quitar eso si fallo email o passworrd, no debo darle esas pistas al usuario
      })
    }
    // ya estamos en un punto en donde el usuario(Correo) y la contraseña son validos

    // crear token
    // no mandar la contraseña en el token
    usuarioDB.password = ':)';
    let token = jwt.sign({ usuario: usuarioDB},SEED,{ expiresIn: 14400} ) // 4 la expiracion
    res.status(200).json({
      ok:true,
      usuario: usuarioDB,
      token:token,
      id: usuarioDB._id
    })
  })

})





module.exports = app;