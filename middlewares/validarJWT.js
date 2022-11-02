const { request, response } = require("express");
const jwt = require("jsonwebtoken");
const db = require("../database/config");

const validarJWT = async(req = request, res = response, next) => {

    const token = req.header('x-token');

    if(!token){
        
        return res.status(400).json({
            msg: 'No se envio el token en el Hader, envie con el nombre: x-token'
        });

    }

    try{

        const mysql = await db;
        const sql = 'SELECT * FROM USUARIO WHERE correo = ? and estado = ?';
        
        const { correo } = await jwt.verify(token, process.env.SECRETORPRIVATEKEY);
        

        mysql.query( sql, [ correo, 1], function(err, result) {
            
            if(err){

                return res.status(500).json({
                    msg: err.sqlMessage
                });

            }else{
                
                if(result.length === 1){

                    req.usuario = result[0];
                    next();

                }else{

                    return res.status(404).json({
                        msg: `no se encontro al usuario con el correo ${correo}`
                    });

                }

            }

        });

    }catch(err){

        // console.log(err);
        console.error(err)
        return res.status(500).json({
            msg: 'Error al validar el JWT, o ya expiro'
        });

    }

}

module.exports = {

    validarJWT

}


// const validarJWT = async(req = request, res = response, next) => {
    
//     const mysql = await db;
//     const { id } = req.params;

//     const sql = `SELECT * FROM usuario WHERE id_usuario = ? and estado = ?`;
//     mysql.query(sql, [id, 1], function(err, result){
        
//         if(err){
            
//             return res.status(500).json({
//                 msg: err.sqlMessage
//             })

//         }else{

//             if( result.length === 1 ){
                
//                 try{

//                     const {correo} = jwt.verify(result[0].token, process.env.SECRETORPRIVATEKEY);
                    
//                     if(result[0].correo === correo){
                        
//                         req.usuario = 'HOLA MUNDO';
//                         next();

//                     }else{
//                         return  res.status(401).json({
//                             msg: 'Error al verificar el JWT'
//                         })
//                     }

//                 }catch(err){
//                     return res.status(401).json({
//                         msg:err.message
//                     })
//                 }


//             }else{
//                 return res.status(404).json({
//                     msg: `No se encontro el usuario con el id ${id}`
//                 })
//             }

//         }

//     })
// }