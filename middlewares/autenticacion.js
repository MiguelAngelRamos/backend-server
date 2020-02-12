const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

//================================
// Verifica Token
//===============================
exports.verificaToken = function(req, res, next){
  let token = req.query.token;
  jwt.verify(token, SEED, (err, decoded)=>{
    if (err) { // 401 Unauthorized que no se encuentra autorizado
      return res.status(401).json({
        ok: false,
        message: "Token incorrect",
        errors: err
      });
    }
    // informacion del usuario disponible en cualquier petición
    req.usuario = decoded.usuario;
    // con esto en donde aplique el token voy a tener disponible la informacion del usuario en el request
    next();
    // res.status(200).json({
    //   ok:true,
    //   decoded
    // })
  });
}
