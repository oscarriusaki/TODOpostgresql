const { response } = require('express');
const express = require('express');
const cors = require('cors');
const db = require('../database/config');

class Server {
    
    constructor(){

        this.app = express();
        this.puerto = process.env.PUERTO;
        this.path = {
            usuario: '/usuario',
            login: '/login',
            tarea: '/tarea',
            error: '/',
        }

        // conectar base de datos
        this.database();
        // middlewares
        this.middlewares();
        // llamamos las rutas
        this.route();

    }
    async database(req, res = response){

        const pg = await db;

        // conectamos a la base de datos
        pg.connect((err, client, release) => {
            
            try{

                // throw console.error(err.sqlMEssage)
                // si sale un error simplemente muestra el error pero el programa no se cuelga
                // pero si pongo: "throw new Error()", se tiene que volver a ejecutar el servidor, 
                // por eso solo puse "console.log()"
                
                if(err){
                    
                    return res.status(500).json({
                        msg: err
                    });

                }else{

                    console.log('Connectado a la base de datos')

                }
                
            }catch(erre){

                if(err.sqlMessage !== undefined){
                    console.log(err.sqlMessage);
                }else{
                    console.log('Error:500 no se conecto con la base de datos vuelva a levantar el servidor');
                }

        }

        }) 
        
    }

    middlewares(){

        // cors para las rutas permitidas o restringir rutas
        this.app.use(cors());
        // json para poder recibir datos de tipo json
        this.app.use(express.json());
        // directorio publico
        this.app.use(express.static('public'));

    }

    route() {
        
        // ruta para el usuario
        this.app.use(this.path.usuario, require('../router/usuario'));
        // ruta del login
        this.app.use(this.path.login, require('../router/login'));
        // ruta para la tarea
        this.app.use(this.path.tarea, require('../router/tarea'));
        // ponermos ultimo el error por si no encuentra ninguna ruta 
        this.app.use(this.path.error, require('../router/error'));

    }

    listen(){

        this.app.listen(this.puerto, () => {
            console.log(`Server corriendo en ${this.puerto}`);
        })

    }

}

module.exports = Server;