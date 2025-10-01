const jwt =require('jsonwebtoken');
var {config} = require('../config.js')




const comprobartoken = (req,res,next)=>{
 const token = req.headers['authorization'];
 console.log(token);
    if(!token){
        return res.status(400).json({
            ok:false,
            msg: 'Falta token de autorizacion'
        })

    }

    try {
        const{email,role,nickname}=jwt.verify(token, config.JWT_SECRET);
        req.role=role;
        req.email=email;
        req.nickname=nickname;
        console.log(req.role );
        next();
    } catch(err) {
        return res.status(400).json({
            ok:false,
            msg:'Token no valido',
            err: err.message
        })
    }

}

module.exports={comprobartoken}