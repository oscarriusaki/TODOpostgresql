# Nota:

1. Primeramente crear la base de datos y hacer funcionar en POSTGRESQL
2. Crear la base de datos y las tablas copiando desde el archivo "BaseDeDatos.txt" o copear lo siguiente

```
/* creando base de datos */

create database gestionar;

/* creando tabla usuario */

create table usuario (

	id_usuario serial not null,
	nombre varchar(50) not null,
	pass text not null,
    correo text not null unique,
	token text not null,
	fecha date not null,
	estado int not null,
	constraint pk_id_usuario primary key (id_usuario)

);

/* crear tabla tarea */

create table tarea (

    id_tarea serial not null,
    titulo varchar(50) not null,
    descripcion text not null,
    fecha date not null,
    estado int not null,
    finalizada int not null,
    id_usuario int not null,

    constraint pk_id_tarea primary key (id_tarea),
    constraint fk_id_usuario foreign key (id_usuario) references usuario(id_usuario)

);

```

3. Clonar la carpeta

```
git clone https://github.com/oscarriusaki/TODOpostgresql.git
```

4. Con la terminal ingresar dentro de la carpeta clonada

```
cd TODOpostgresql
```

5. Para descargar los packetes en la terminal escribir

```
npm install
```

6. Finalmente escribir

```
nodemon app
```

7. Porfavor siga los pasos que se les mensiono de lo contrario no funcionara el programa grasias
   ahora puede hacer pruebas de error o registrar otros usuarios, hacer login etc. con algun programa,
   recomendado POSTMAN u otro.

8. Cualquier duda del codigo porfavor comunicarse con el desarollador BACKEND...
