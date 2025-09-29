const jwt =require('jsonwebtoken');
var {config} = require('../config.js')




const comprobartoken = (req,res,next)=>{
 const token = req.headers['authorization'];
    if(!token){
        return res.status(400).json({
            ok:false,
            msg: 'Falta token de autorizacion'
        })

    }

    try {
        const{correo,rol,nombre}=jwt.verify(token, config.SECRET_JWT_KEY);
        req.rol=rol;
        req.correo=correo;
        req.nombre=nombre;
        next();
    } catch(err) {
        return res.status(400).json({
            ok:false,
            msg:'Token no valido'
        })
    }

}

module.exports={comprobartoken}