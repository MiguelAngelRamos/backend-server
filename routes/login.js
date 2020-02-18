const express = require("express");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SEED = require("../config/config").SEED;
const app = express();

const Usuario = require("../models/usuario");

//Google
const CLIENT_ID = require("../config/config").CLIENT_ID;
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(CLIENT_ID);

//==============================================
//  Autenticacion Google
//==============================================

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload(); // aqui obtenemos toda la informacion de dicho usuario
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  // Retornamos los que nos interesa del payload
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

app.post("/google", async (req, res) => {
  let token = req.body.token;

  let googleUser = await verify(token).catch(e => {
    return res.status(403).json({
      ok: false,
      mensaje: "token no valido"
    });
  });
  // verificar si ese correo  existe en mi base de datos
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        message: "Error al buscar usuario",
        errors: err
      });
    }

    if (usuarioDB) {
      // verificar si se auntentico por google
      if (usuarioDB.google === false) {
        // si existe un correo google es decir gmail pero su autenticacion la hizo normal por eso esta false entonces
        // no le dejo autenticar de esta forma y le indico que use su autenticacion normal
        return res.status(400).json({
          ok: false,
          mensaje: "Debe de usar su autenticacion normal"
        });
      } else {
        // generar un nuevo token y mandar la respuesta
        let token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        }); // 4 la expiracion
        return res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      }
    } else {
      // El usuario no existe hay que crearlo
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ":)";

      usuario.save((err, usuarioDB) => {
        let token = jwt.sign({ usuario: usuarioDB }, SEED, {
          expiresIn: 14400
        }); // 4 la expiracion
        return res.status(200).json({
          ok: true,
          usuario: usuarioDB,
          token: token,
          id: usuarioDB._id
        });
      });
    }
  });
  // return res.status(200).json({
  //   ok: true,
  //   mensaje: "OK!!!",
  //   googleUser: googleUser
  // });
});
//==============================================
//  Autenticacion normal
//==============================================

app.post("/", (req, res) => {
  let body = req.body;

  // verificiar si existe un usuario con ese correo electronico
  Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
    if (err) {
      // aca si es un error 500 deberia mandarnos algo un usuario vacio  si es que llega aca es un error 500 es un error serio de servidor
      return res.status(500).json({
        ok: false,
        message: "Error al buscar usuario",
        errors: err
      });
    }

    if (!usuarioDB) {
      return res.status(400).json({
        ok: false,
        message: "Credenciales incorrectas - email",
        errors: err
      });
    }
    // tenemos un usuario que puso su correo electronico valido
    if (!bycrypt.compareSync(body.password, usuarioDB.password)) {
      // esto va regresar un valor boleano true si lo hace correcto y false si es incorrecto
      return res.status(400).json({
        ok: false,
        message: "Credenciales incorrectas - password",
        errors: err
        // ojo que cuando este en produccion debo quitar eso si fallo email o passworrd, no debo darle esas pistas al usuario
      });
    }
    // ya estamos en un punto en donde el usuario(Correo) y la contraseña son validos

    // crear token
    // no mandar la contraseña en el token
    usuarioDB.password = ":)";
    let token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4 la expiracion
    res.status(200).json({
      ok: true,
      usuario: usuarioDB,
      token: token,
      id: usuarioDB._id
    });
  });
});

module.exports = app;
