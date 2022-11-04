const { response } = require('express');
const { generarJWT } = require('../helpers/generarWJT');
const bcryptjs = require('bcryptjs');
const db = require('../database/config');

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

module.exports = {

    login

}