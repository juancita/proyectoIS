const express = require('express');
const path = require('path');
const bodyParser = require('express'); // Para manejar datos del cuerpo de las solicitudes POST
const sequelize = require('./db');
const Pedido = require('./models/Pedido'); // Modelo Pedido

const app = express();

// Configuración del motor de plantillas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public'))); // Archivos estáticos
app.use(bodyParser.urlencoded({ extended: true })); // Para datos codificados en formularios
app.use(bodyParser.json()); // Para solicitudes con datos JSON

// Sincronización de la base de datos
sequelize
  .sync({ force: true }) // Usa "force: true" solo en desarrollo para limpiar y recrear las tablas
  .then(() => {
    console.log('Base de datos sincronizada y tablas creadas');
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });

// Rutas
// Ruta principal
app.get('/', (req, res) => {
  res.render('index', {
    title: 'Inicio',
    heading: '¡Bienvenido!',
    message: 'Gestor de pedidos para productos de maíz.',
  });
});

// Registrar pedido
app.post('/pedidos', async (req, res) => {
  try {
    const { cliente, producto, cantidad, total } = req.body;
    const pedido = await Pedido.create({ cliente, producto, cantidad, total });
    res.status(201).json(pedido);
  } catch (err) {
    res.status(500).send('Error al registrar el pedido');
  }
});

// Consultar pedidos
app.get('/pedidos', async (req, res) => {
  try {
    const pedidos = await Pedido.findAll();
    res.render('pedidos', { pedidos });
  } catch (err) {
    res.status(500).send('Error al consultar pedidos');
  }
});

// Editar pedido
app.put('/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { cliente, producto, cantidad, total } = req.body;
    await Pedido.update({ cliente, producto, cantidad, total }, { where: { id } });
    res.send('Pedido actualizado');
  } catch (err) {
    res.status(500).send('Error al editar el pedido');
  }
});

// Eliminar pedido
app.delete('/pedidos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Pedido.destroy({ where: { id } });
    res.send('Pedido eliminado');
  } catch (err) {
    res.status(500).send('Error al eliminar el pedido');
  }
});

// Configuración del puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
