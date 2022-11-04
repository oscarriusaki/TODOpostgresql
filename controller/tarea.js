const { response } = require("express");
const db = require("../database/config");

const getTareas = (req, res = response) => {

    const pg = db;

    const sql = 'SELECT * FROM tarea WHERE estado = $1 ORDER BY id_tarea desc';
    
    pg.query( sql, [ 1 ], (err, result) => {
        
        if(err){
            
            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{
            
            if(result.rows.length !== 0){

                return res.status(200).json({
                    msg: result.rows
                });

            }else{

                return res.status(404).json({
                    msg: 'No se encontraron ninguna tarea'
                });

            }   

        }

    });
    
}

const getTarea = async (req, res = response) => {
    
    const pg = await db;
    
    const { id } = req.params;
    
    const sql = 'SELECT * FROM TAREA WHERE id_tarea = $1 and estado = $2';

    pg.query( sql, [ id, 1], (err, result) => {
        
        if(err){
            
            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{

            if(result.rows.length === 1){
                
                    return res.status(200).json({
                        msg: result.rows
                    });

            }else{

                return res.status(404).json({
                    msg: `No se encontro la tarea con id ${id}`
                });

            }

        }

    });

}

const postTarea = async(req, res = response) => {

    const pg = await db;
    const id_usuario_logueado = req.usuario.id_usuario;
    
    const { id_tarea, ... tarea} = req.body;

    const yy = new Date().getFullYear();
    const mm = new Date().getMonth()+1;
    const dd = new Date().getDate();

    const sql = 'INSERT INTO TAREA (titulo, descripcion, fecha, estado, finalizada, id_usuario) values ($1,$2,$3,$4,$5,$6)';

    pg.query( sql, [ (tarea.titulo), (tarea.descripcion), ( yy +"/"+mm+"/"+dd ), 1, 0, id_usuario_logueado], (err, result) => {
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
                    msg: 'Tarea registrado'
                });

            }else{

                return res.status(400).json({
                    msg: 'Error al registrar tarea'
                });

            }

        }

    });
}

const putTarea = async (req, res = response) => {

    const pg = await db;
    const usuario_logueado = req.usuario.id_usuario;
    
    const { id } = req.params;
    const { id_tarea, ...tarea} = req.body;

    const yy = new Date().getFullYear();
    const mm = new Date().getMonth()+1;
    const dd = new Date().getDate();

    const sql = 'SELECT * FROM TAREA WHERE id_tarea = $1 AND estado = $2';
    const sql2 = 'UPDATE TAREA SET titulo = $1, descripcion = $2, finalizada = $3, fecha = $4 WHERE id_tarea = $5';

    pg.query( sql, [ id, 1], (err, result) => {

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
    
                    pg.query( sql2,[ tarea.titulo, tarea.descripcion, tarea.finalizada, ( yy +"/"+mm+"/"+dd ), id], (err, result) => {
                        
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
                                    msg: 'Tarea actualizada'
                                });
    
                            }else{
    
                                return res.status(400).json({
                                    msg: 'Error al actualizar'
                                });
    
                            }
    
                        }
    
                    });

                }else{
                    
                    return res.status(401).json({
                        msg: `El token no pertenece al usuario con id ${usuario_logueado}`
                    });

                }

            }else{

                return res.status(404).json({
                    msg: `No se encontro una tarea con el id ${id}`
                });

            }   

        }

    });

}

const deleteTarea = async (req, res = response) => {
    
    const pg = await db;
    const usuario_logueado = req.usuario.id_usuario;
    
    const { id } = req.params;

    const sql = 'SELECT * FROM TAREA WHERE id_tarea = $1 AND estado = $2';
    const sql2 = 'UPDATE TAREA SET estado = $1 WHERE id_tarea = $2';

    pg.query( sql, [ id, 1], (err, result) => {
        
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
                                    msg: 'tarea eliminado'
                                });

                            }else{

                                return res.status(400).json({
                                    msg: 'Error al eliminar'
                                });

                            }

                        }

                    });

                }else{
                
                    return res.status(401).json({
                        msg: `El token no pertenece al usuario con id ${usuario_logueado}`
                    });
                
                }

            }else{
                
                return res.status(404).json({
                    msg: `No existe la tarea con id ${id}`
                });

            }

        }
    });

}

const finalizarTarea = async ( req, res = response) => {

    // finalizada = 1 -> se finalizo la tarea
    // finalizada = 0 -> no se finalizo la tarea

    const pg = await db;
    const usuario_logueado = req.usuario.id_usuario;

    const { id } = req.params;
    
    const sql = 'SELECT * FROM TAREA WHERE id_tarea = $1 and estado = $2 AND id_usuario = $3';
    const sql2 = 'UPDATE TAREA SET finalizada = $1 WHERE id_tarea = $2 AND estado = $3 AND id_usuario = $4';
    // const sql2 = 'UPDATE TAREA SET finalizada = !(SELECT finalizada FROM TAREA WHERE id_tarea = $1 and estado = $2 AND id_usuario = $3) WHERE id_tarea = $4 AND estado = $5 AND id_usuario = $6';

    pg.query( sql, [ id, 1, usuario_logueado], (err, result)=>{
        
        if(err){

            return res.status(500).json({
                code: err.code, 
                name: err.name, 
                hint: err.hint,
                detail: err.detail,
            });

        }else{

            const r = !(result.rows[0].finalizada)*1;

            if(result.rows.length === 1){

                pg.query( sql2, [ r, id, 1, usuario_logueado ], (err, result)=>{
                // pg.query( sql2, [ id, 1, usuario_logueado, id, 1, usuario_logueado], (err, result) =>{
                  
                    if(err){
                        return res.status(500).json({
                            code: err.code, 
                            name: err.name, 
                            hint: err.hint,
                            detail: err.detail,
                        });

                    }else{

                        if(result.rowCount === 1){
                            
                            pg.query( sql, [ id, 1, usuario_logueado], (err, result) =>{
 
                                if(err){
                                    
                                    return res.json({
                                        code: err.code, 
                                        name: err.name, 
                                        hint: err.hint,
                                        detail: err.detail,
                                    });

                                }else{

                                    if(result.rows.length === 1){

                                        return res.status(200).json({
                                            msg: (result.rows[0].finalizada === 1)? 'Tarea finalizada': 'Tarea no finalizada'
                                         });

                                    }else{

                                        return res.status(400).json({
                                            msg: 'Error al buscar la tarea modificada'
                                        })

                                    }

                                }

                            });
                            

                        }else{

                            return res.status(400).json({
                                msg: 'Error al finalizar una tarea'
                            })

                        }

                    }

                })

            }else{

                return res.status(404).json({
                    msg: `No se encontro la tarea con el id ${ id }`
                })

            }

        }

    });

}

module.exports = {
    
    getTareas,
    getTarea,
    postTarea,
    putTarea,
    deleteTarea,
    finalizarTarea

}