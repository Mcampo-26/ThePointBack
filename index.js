import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import http from 'http'; // Importar el módulo http
import { Server } from 'socket.io'; // Importar socket.io
import routerPagos from './src/Routes/Pagos/index.js';
import routerProductos from './src/Routes/Productos/index.js';
import routerVentas from './src/Routes/Ventas/index.js';
import { dbConnect } from './src/database/config.js';

const app = express();
const server = http.createServer(app); // Crear servidor HTTP
const io = new Server(server, {
  cors: {
  origin: ['https://thepoint.netlify.app'],
   // origin: ['http://localhost:5173'],// ngrok
    methods: ['GET', 'POST'],
  },
});




// Hacer que `io` esté disponible en toda la aplicación
app.locals.io = io; // Agregar `io` a `app.locals`

const PORT = process.env.PORT || 8080;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de CORS
app.use(cors({
  origin: ['https://thepoint.netlify.app',"http://localhost:5173"], // Permite solicitudes desde el dominio de tu frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // Permite estos encabezados
  credentials: true, // Permitir envío de cookies o autenticación basada en tokens
}));

// Middleware para manejar solicitudes preflight (OPTIONS)
app.options('*', cors());

// Configuración de Socket.io
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Puedes enviar eventos desde el backend al frontend
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

app.use(morgan('dev'));

// Montar rutas
app.use('/Pagos', routerPagos);
app.use('/Productos', routerProductos);
app.use('/',routerVentas);

// Iniciar servidor
server.listen(PORT, () => { // Usar server.listen en lugar de app.listen
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});

// Conectar a la base de datos
dbConnect()
  .then(() => {
    console.log('Estoy listo y conectado a la base de datos');
  })
  .catch(error => {
    console.error('Error al conectar con la base de datos:', error);
  });
