const express = require('express');
const mdAutenticacion = require('../middlewares/autenticacion');
const Medico = require('../models/medico')
const app = express();

// get Obtener los medicos

app.get('/', (req, res)=>{

  let desde = req.query.desde || 0;
  desde = Number(desde);

  Medico.find({})
  .skip(desde)
  .limit(5)
  .populate('usuario', 'nombre email')
  .populate('hospital')
  .exec((err, medico)=>{
    if(err){
      return res.status(500).json({
        ok: false,
        error: err,
        message: 'Error al intentar cargar medicos'
      })
    }

    Medico.count({}, (err, contadorMedicos)=>{
      
      if(err){
        return res.status(500).json({
          ok: false,
          error: err,
          message: 'Error al intentar contar medicos'
        })
      }
      res.status(200).json({
        ok:true,
        medicos: medico,
        Total: contadorMedicos
      });
    })


  });
});

// put
app.put('/:id', mdAutenticacion.verificaToken, (req, res)=>{
  let id = req.params.id;
  let body = req.body;

  Medico.findById(id, (err, medicoDB)=>{
    if(err){
      return res.status(500).json({
        ok:false,
        err:err,
        message: 'Error al intentar buscar medico',
      })
    }
    if(!medicoDB){
      return res.status(400).json({
        ok:false,
        message: 'El medico con el id' + id + 'no existe..',
      })
    }
  
    medicoDB.nombre = body.nombre;
    medicoDB.usuario = req.usuario._id;
    medicoDB.hospital = body.hospital;
  
    medicoDB.save((err, medicoGuardado)=>{
      if(err){
        return res.status(500).json({
          ok:false,
          message: "Error al intentar guardar",
          errors: err
        });
      }
      res.status(200).json({
        ok:true,
        medico:medicoGuardado
      });
    });
  });
});


// post
app.post('/', mdAutenticacion.verificaToken, (req, res)=>{
  let body = req.body;

  let medico = new Medico({
    nombre: body.nombre,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoGuardado)=>{
    if(err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'Error al crear un medico en la DB',
        errors : err
      });
    }
    res.status(201).json({
      ok:true, 
      medico: medicoGuardado
    })
  })
})

// delete Borra un medico por la id

app.delete('/:id', mdAutenticacion.verificaToken, (req, res)=>{
  let id = req.params.id;

  Medico.findByIdAndRemove(id, (err, medicoBorrado)=>{

    if(err){
      return res.status(500).json({
        ok:false,
        mensaje: 'Error al borrar medico',
        errors : err
      });
    }

    if(!medicoBorrado){
      return res.status(400).json({
        ok:false,
        mensaje: "Error al borrar medico",
        errors: err
      });
    }

    res.status(200).json({
      ok:true,
      medico: medicoBorrado,
  message: 'El medico a sido borrado de la Base de Datos'
    })
  })
})

module.exports = app;