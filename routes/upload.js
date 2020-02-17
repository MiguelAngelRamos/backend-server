const express = require("express");
const fileUpload = require("express-fileupload");
const fs = require("fs"); // me va ayudar a borrar la imagen
const app = express();
const Usuario = require("../models/usuario");
const Medico = require("../models/medico");
const Hospital = require("../models/hospital");

// default options
app.use(fileUpload());
// usamos put por que los registros ya existen, solo vamos actualiza la imagen de las colecciones

app.put("/:tipo/:id", (req, res) => {
  const tipo = req.params.tipo;
  const id = req.params.id;
  // tipos de coleccion
  const tiposValidos = ["hospitales", "medicos", "usuarios"];

  if (tiposValidos.indexOf(tipo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Tipo de colección no es válida",
      error: { message: "Tipo de colección no es válida" }
    });
  }
  // si viene archivos
  if (!req.files) {
    return res.status(400).json({
      ok: false,
      mensaje: "No selecciono nada",
      error: { message: " Debe selecionar una imagen" }
    });
  }

  // revizar si el archivo es una imagen
  // obtener nombre del archivo
  let archivo = req.files.imagen;
  //extraer la extension del archivo
  let nombreCortado = archivo.name.split(".");
  // la extension del archivo siempre va ser la ultima posicion del arreglo
  let extensionArchivo = nombreCortado[nombreCortado.length - 1];

  // extensiones permitidas (arreglo de extensiones validas)
  const extensionesValidas = ["png", "jpg", "gif", "jpeg"];
  // validar que la extension del archivo este dentro de las extensiones validas
  // si regresa cualquier cosa menor a cero es que no la encuentra
  if (extensionesValidas.indexOf(extensionArchivo) < 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Extension no válida",
      error: {
        message: "Las extensiones válidas son " + extensionesValidas.join(", ")
      }
      // las unimos con una , y un espacio con el join
    });
  }

  // Nuevo de archivo personalizado
  // id-numerorandom-extension (numero random prevenir el cache del navegador web)
  const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

  // mover al archivo del temporal al path

  const path = `./uploads/${tipo}/${nombreArchivo}`;

  archivo.mv(path, err => {

    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: "Error al mover archivo",
        error: err
      });
    }
    subirPorTipo(tipo, id, nombreArchivo, res);
  });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
  // recibimos tambien res, por que queremos sacar la respuesta en formato json
  // en esta funcion
  if (tipo === "usuarios") {
    Usuario.findById(id, (err, usuario) => {
      // agregarlos errores
      if(!usuario){
        return res.status(400).json({
          ok:false,
          mensaje: 'El Usuario no existe',
          errors: { message: 'Usuario no existe'}
        })
      }
      const pathViejo = "./uploads/usuarios/"+usuario.img;
      // si existe una imagen en este path debo borrarla
      if (fs.existsSync(pathViejo)) {
        // lo borro con esto
        fs.unlinkSync(pathViejo);
      }

      usuario.img = nombreArchivo;
      usuario.save((err, usuarioActualizado) => {
        usuarioActualizado.password = ':)';
 
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          usuario:usuarioActualizado
        });
      });
    });
  }
  if (tipo === "medicos") {
    Medico.findById(id, (err, medico) => {
      // agregarlos errores
      if(!medico){
        return res.status(400).json({
          ok:false,
          mensaje: 'El Medico no existe',
          errors: { message: 'Medico no existe'}
        })
      }
      const pathViejo = "./uploads/medicos/"+medico.img;
      // si existe una imagen en este path debo borrarla
      if (fs.existsSync(pathViejo)) {
        // lo borro con esto
        fs.unlinkSync(pathViejo);
      }

      medico.img = nombreArchivo;
      medico.save((err, medicoActualizado) => {

        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          medico: medicoActualizado
        });
      });
    });
  }
  if (tipo === "hospitales") {

    Hospital.findById(id, (err, hospital) => {
      // agregarlos errores

      if(!hospital){
        return res.status(400).json({
          ok:false,
          mensaje: 'El hospital no existe',
          errors: { message: 'hospital no existe'}
        })
      } 
      const pathViejo = "./uploads/hospitales/"+hospital.img;
      // si existe una imagen en este path debo borrarla
      if (fs.existsSync(pathViejo)) {
        // lo borro con esto
        fs.unlinkSync(pathViejo);
      }

      hospital.img = nombreArchivo;
      hospital.save((err, hospitalActualizado) => {
  
        return res.status(200).json({
          ok: true,
          mensaje: "Imagen de usuario actualizada",
          hospital:hospitalActualizado
        });
      });
    });
  }
}

module.exports = app;
