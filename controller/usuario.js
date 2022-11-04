const { response } = require("express");
const { generarJWT } = require("../helpers/generarWJT");
const bcryptjs = require('bcryptjs');
const db = require("../database/config");

const getUsers = async (req, res = response) => {

    const pg = await db;

    // estado = 1 -> usuario no esta eliminado
    // estado = 0 -> usuario esta eliminado
    
    const sql = 'SELECT * FROM usuario WHERE estado = $1';
    
    pg.query( sql, [ 1 ], (err, result)=>{
            console.log(result);
        if(err){

            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{
            
            if(result.rows.length !== 0){
               
                return res.status(200).json(
                    result.rows
                );

            }else{

                return res.status(404).json({
                    msg: 'No existe registros de usuarios en la base de datos' 
                });

            }

        }

    })
}

const getUser = async (req, res = response) => {

    const pg = db;
    const { id } = req.params;

    const sql = 'SELECT * FROM USUARIO WHERE id_usuario = $1 AND estado = $2';
    
    pg.query( sql, [ id, 1], (err, result) =>{

        if(err){
            
            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{

            if(result.rows.length === 1){

                return res.status(200).json(
                    result.rows 
                );

            }else{

                return res.status(404).json({
                    msg: `No se encontro el usuario con el id ${id}`
                });

            }

        }

    });

}

const postUser = async (req, res = response) => {
    
    const pg = await db;
    const { is_usuario, ...usuario } = req.body;
    let token = '';

    // ponermos un try{}catch(){} por si nos da algun error

    try{

        // generamos el jwt
        token = await generarJWT(usuario.correo);
        
        // incriptando contraseña
        // generamos la salt con una intensidad de 10 por defecto, si quiere mayor proteccion poner un numero elevado
        const salt = bcryptjs.genSaltSync();
        usuario.pass = bcryptjs.hashSync(usuario.pass, salt);
    
    }catch(err){
            console.log(err)
        return res.status(500).json({
            msg: 'Error hable con el adminstrador'
        })

    }

    const yy = new Date().getFullYear();
    const mm = new Date().getMonth()+1;
    const dd = new Date().getDate();

    const sql1 = 'SELECT * FROM USUARIO WHERE correo = $1 AND estado = $2';
    const sql2 = 'INSERT INTO USUARIO (nombre, pass, correo, token, estado, fecha) values($1,$2,$3,$4,$5,$6)';
    const sql3 = 'SELECT * FROM USUARIO WHERE correo = $1 and token = $2 and estado = $3';

    pg.query( sql1, [ usuario.correo, 1], (err, result) => {

        if(err){

            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{
            if(result.rows.length !== 1){
                
                pg.query( sql2, [ usuario.nombre, usuario.pass, usuario.correo, token, 1, (yy + "/" + mm + "/" + dd)], (err2, result) => {
                    
                    if(err2){
                        
                        return res.status(500).json({
                            msg: err2.sqlMessage
                        });
                        
                    }else{
                        
                        if(result.rowCount === 1){

                            pg.query( sql3, [ usuario.correo, token, 1], (err, result) =>{

                                if(err){

                                    return res.status(500).json({
                                        code: err.code, 
                                        name: err.name, 
                                        hint: err.hint,
                                        detail: err.detail,
                                    });

                                }else{

                                    if(result.rowCount === 1){

                                        req.usuario = result.rows[0];
                                        
                                        return res.status(201).json({
                                            msg: 'Registrado correctamente',
                                            token: token
                                        });
                                    
                                    }else{

                                        return res.status(400).json({
                                            msg: 'Error al buscar el usuario registrado'
                                        });

                                    }
                                
                                }
    
                            });

                        }else{
                            
                            return res.status(400).json({
                                msg: 'Hubo un error al registrar un usuario'
                            });

                        }

                    }

                });

            }else{

                return res.status(400).json({
                    msg: `Error el correo ${usuario.correo} ya se encuentra registrado`
                });

            }

        }
    });
}
const putUser = async (req, res = response) => {
    
    const pg = await db;
    const usuario_logueado = req.usuario.id_usuario;

    const { id } = req.params;
    const { usuario_id, ...usuario } = req.body;
    // Encriptamos la contraseña 
    if( usuario.pass ){

        const salt = bcryptjs.genSaltSync();
        usuario.pass = bcryptjs.hashSync(usuario.pass, salt);

    }
    // Generamos un nuevo token por si el usuario camsbia el correo
    let token ='';
    if( usuario.correo ){
        token = await generarJWT(usuario.correo);
    }

    const yy = new Date().getFullYear();
    const mm = new Date().getMonth()+1;
    const dd = new Date().getDate();

    // verificamos que exista el usuario al que quiere actualizar
    const sql = 'SELECT * FROM usuario WHERE id_usuario = $1 AND estado = $2';  // para select es rows.length
    // verificamos que el correo que nos manda sea unico, y si nos manda el mismo correo si se puede actualiza
    const sql2 = 'SELECT * FROM  usuario WHERE correo = $1';
    // actualizamos 
    const sql3 = 'UPDATE usuario SET nombre = $1, pass = $2, correo = $3, token = $4, fecha = $5 WHERE id_usuario = $6';

    pg.query( sql,[ id, 1], (err, result) =>{
        
        if(err){
            
            return res.status(500).json({
                msg: err
            })

        }else{

            if(result.rows.length === 1){

                if(result.rows[0].id_usuario === usuario_logueado){
                
                    pg.query( sql2, [ usuario.correo ], (err, result)=>{
                    
                    if(err){

                        return res.status(500).json({
                            code: err.code, 
                            name: err.name, 
                            hint: err.hint,
                            detail: err.detail,
                        });

                    }else{

                        if((result.rows.length ===0) || (result.rows[0].id_usuario+'' === id+'')){

                            pg.query( sql3, [ usuario.nombre, usuario.pass, usuario.correo, token, (yy + "/" + mm + "/" + dd),id], (err, result) =>{ 

                                if(err){
                                    
                                    return res.status(500).json({
                                        code: err.code, 
                                        name: err.name, 
                                        hint: err.hint,
                                        detail: err.detail,
                                    });

                                }else{

                                    return res.status(200).json({
                                        msg: 'Actualizado correctamente'
                                    });

                                }

                            })

                        }else{

                            return res.status(400).json({
                                msg: 'Error el correo ya esta registrado '
                            });

                        }

                    }

                    });

                }else{
                
                    return res.status(401).json({
                        msg: `El token no pertenece al usuario con id ${id}`
                    });
                
                }

            }else{

                return res.status(404).json({
                    msg: `El usuario con id ${id} no existe`
                });

            }
            
        }
    
    });

}

const deleteUser = async (req, res = response) => {
    
    const pg = await db;
    const usuario_logueado = req.usuario.id_usuario;
    
    const { id } = req.params;

    const sql = 'SELECT * FROM usuario where estado = $1 and id_usuario = $2';
    const sql2 = 'UPDATE USUARIO SET estado = $1 where id_usuario = $2';
 
    // estado = 1 -> usuario no eliminado
    // estado = 0 -> usuario eliminado

    pg.query( sql, [ 1, id], (err, result) => {

        if(err){
            
            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{

            if(result.rows.length === 1){

                if(result.rows[0].id_usuario === usuario_logueado){

                    pg.query( sql2, [ 0, id], (err, result) => {

                        if(err){

                            return res.status(500).json({
                                code: err.code, 
                                name: err.name, 
                                hint: err.hint,
                                detail: err.detail,
                            });

                        }else{

                            if(result.rowCount === 1){

                                return res.status(200).json({
                                    msg: 'Eliminado'
                                });

                            }else{

                                return res.status(400).json({
                                    msg: 'Error se afecto a varias columas revisar la base de datos'
                                });

                            }

                        }

                    });
                
                }else{

                    return res.status(401).json({
                        msg: `El token no pertenece al usuario con id ${id}`
                    });

                }

            }else{       
                
                return res.status(404).json({
                    msg: `No existe el usuario con el id ${id}`
                });

            }

        }

    });

}

module.exports = {
    
    getUsers,
    getUser,
    postUser,
    putUser,
    deleteUser

}