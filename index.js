
const express = require('express');
const app = express();
const morgan = require('morgan');
const port = 3000;

//uso de morgan

app.use(morgan('dev'));

// levantar servidor en el puerto 3000
app.listen(port, () => {
    console.log(`Servidor iniciado en puerto 3000`);
  });
  
  //Importando funcion desde el modulo consultas.js
const { agregar, todos, editar, eliminar, nuevaTransferencia, obtenerTransferencias } = require('./consultas/consultas.js');

//middleware para recibir desde el front como json
app.use(express.json());

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
})

// Ruta POST para insertar un nuevo usuario
app.post('/usuario', async (req, res) => {
  try {
    console.log("contenido req,body: " , req.body);
    const { nombre, balance } = req.body;
    console.log("Valores recibidos: " , nombre, balance);
    await agregar (nombre, balance);

    res.status(201).send('Usuario creado correctamente');
  } catch (error) {
    console.error('Error al crear al usuario:', error);
    res.status(500).send('Error al crear el usuario');
  }
});

// Ruta GET para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const data = await todos()
    res.json(data);
  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
    res.status(500).send('Error al obtener los usuarios');
  }
});

// Ruta PUT para editar un usuario
app.put('/usuario', async (req, res) => {
  try {
    const { id } = req.query;
    console.log("valores req,body: " , req.body);
    const { name, balance } = req.body;
    
    const result = await editar(id, name, balance);

    res.send(result);
  } catch (error) {
    console.error('Error al actualizar el usuario:', error);
    res.status(500).send('Error al actualizar el usuario');
  }
});

// Ruta DELETE para eliminar un usuario
app.delete('/usuario', async (req, res) => {
  try {
    const { id } = req.query;
    console.log("Usuario eliminado: " , id);
    await eliminar (id);
    res.send("Usuario eliminado correctamente");
  } catch (error) {
    console.error('Error al eliminar el usuario:', error);
    res.status(500).send('Error al eliminar el usuario');
  }
});

// Ruta POST para realizar una transferencia entre usuarios
app.post('/transferencia', async (req, res) => {
    try {
        const { emisor, receptor, monto } = req.body;
        // Llama a la función de transferir definida en consultas.js
        const resultado = await nuevaTransferencia(emisor, receptor, monto);
        console.log("Transferencia realizada con exito");
        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al realizar la transferencia:', error);
        res.status(500).json({ error: 'Error al realizar la transferencia' });
    }
});

// Ruta GET para obtener todas las transferencias
app.get('/transferencias', async (req, res) => {
    try {
      const result = await obtenerTransferencias(); 
      res.status(200).json(result);
    } catch (error) {
      console.error('Error al obtener las transferencias:', error);
      res.status(500).json({ error: 'Error al obtener las transferencias' });
    }
  });