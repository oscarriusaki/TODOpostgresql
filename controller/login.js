const { response, json } = require('express');
const { generarJWT } = require('../helpers/generarWJT');
const bcryptjs = require('bcryptjs');
const db = require('../database/config');
const { googleVerify } = require('../helpers/google-verify');

const login = async (req, res = response) => {
    
    const pg = await db;
    let token = '';

    const { pass, correo } = req.body;
    
    const sql = 'SELECT * FROM usuario WHERE correo = $1 AND estado = $2'; // <- esta linea es para evitar injeccion sql
    const sql2 = 'UPDATE usuario SET token = $1 WHERE id_usuario = $2 and correo = $3 and estado = $4 '; // <- esta linea es para evitar injeccion sql

    pg.query( sql,[ correo, 1], async (err , result) =>{
        console.log(result.rows);
        if(err){

            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });
            
        }else{

           /*  result.map(resp => (
                 {...resp[0]}
            )); */

            if(result.rows.length === 1){
                
                // ponemos un try{}catch(){} si hay error al desincriptar o al generar token y para algun otro error
                try{

                    // desincriptamos la contrasenia 
                    const validarPassword = bcryptjs.compareSync(pass, result.rows[0].pass);
                    
                    if( validarPassword ){

                        // generamos el token
                        token = await generarJWT(correo);

        
                        pg.query(sql2, [token, result.rows[0].id_usuario, result.rows[0].correo,1], (err, result) =>{
                            
                            if(err){

                                return res.status(500).json({
                                    code: err.code, 
                                    name: err.name, 
                                    hint: err.hint,
                                    detail: err.detail,
                                });

                            }else{

                                return res.status(200).json({
                                    msg: 'Usuario logueado correctamente',
                                    token: token,
                                });

                            }

                        });
                        
                    }else{

                        return res.status(400).json({
                            msg: 'Usuario o contraseña incorrecta'
                        });

                    }
                    
                }catch(err){
                    console.log(err);
                    return res.status(500).json({
                        msg: 'Hable con el administrador'
                    });

                }

            }else{

                return res.status(404).json({
                    msg: `No se encontro el usuario con el correo ${correo}`
                });
                
            }

        }
        
    });

}

const googleSignIn = async (req, res = response) => {
    
    const {id_token} = req.body;
    const postgresql = await db;

    const yy = new Date().getFullYear();
    const mm = new Date().getMonth()+1;
    const dd = new Date().getDate();

    const sql = 'SELECT * FROM usuario WHERE correo = $1 AND estado = $2';
    const sql2 = 'INSERT INTO usuario (nombre, pass, correo, token, estado, fecha) values ($1, $2, $3, $4, $5, $6)';
    // (nombre, pass, correo, token, estado, fecha)
    try{

        const { nombre, img, correo} = await googleVerify(id_token);
        console.log(nombre,'este es el nombre')
        postgresql.query(sql, [ correo, 1], async (err, result) => {

            if(err){

                return res.status(500).json({
                    code: err.code, 
                    name: err.name, 
                    hint: err.hint,
                    detail: err.detail,
                });

            }else{
                
                if(result.rows.length === 0){

                    const token_generado = await generarJWT(correo);
                    postgresql.query( sql2, [ nombre, 'password', correo, token_generado, 1, (yy +'/'+ mm +'/'+ dd ) ], ( err, result) => {

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
                                    msg: 'Registrado con exito',
                                    id_token
                                })

                            }else{

                                return res.status(400).json({
                                    msg: 'No se registro'
                                })

                            }

                        }

                    })

                }else{

                    if(result.rows.length === 1){

                        return res.status(200).json({
                            msg: 'Si se encontro al usuario',
                            id_token
                        })

                    }else{
                        
                        return res.status(404).json({
                            msg: 'No se encontro al usuario'
                        })

                    }

                }

            }
        });

    }catch(err){
        res.status(400).json({
            ok:false,
            msg: 'El token no se pudo verificar'
        })
    }

}

module.exports = {

    login,
    googleSignIn

}