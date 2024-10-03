import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http'; // Importar el módulo http para crear el servidor HTTP
import { Server } from 'socket.io'; // Importar socket.io
import routerPagos from './src/Routes/Pagos/index.js';
import routerProductos from './src/Routes/Productos/index.js';
import { dbConnect } from './src/database/config.js';

const app = express();
const server = http.createServer(app); // Crear servidor HTTP usando el módulo http
const io = new Server(server, {
  cors: {
    origin: ['https://thepoint.netlify.app'], // Reemplaza con la URL de tu frontend
    methods: ['GET', 'POST'],
  },
});
const PORT = process.env.PORT || 8080;

// Middleware para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
  origin: ['https://thepoint.netlify.app'], // Permite solicitudes desde el dominio de tu frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite estos encabezados
  credentials: true, // Permitir envío de cookies o autenticación basada en tokens
}));

// Middleware para manejar solicitudes preflight (OPTIONS)
app.options('*', cors());

// Configuración de Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Aquí puedes manejar eventos del frontend
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });

  // Ejemplo de enviar un mensaje al cliente desde el servidor
  socket.emit('serverMessage', 'Bienvenido, estás conectado al servidor WebSocket');
});

// Middleware para logs
app.use(morgan('dev'));

// Montar rutas
app.use('/Pagos', routerPagos);
app.use('/Productos', routerProductos);

// Iniciar servidor y escuchar conexiones
server.listen(PORT, () => { // Usar server.listen en lugar de app.listen para manejar WebSockets
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Conectar a la base de datos
dbConnect()
  .then(() => {
    console.log('Conectado a la base de datos exitosamente');
  })
  .catch(error => {
    console.error('Error al conectar con la base de datos:', error);
  });
