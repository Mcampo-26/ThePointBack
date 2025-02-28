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
const PORT = process.env.PORT || 8080;

// Configuración de CORS para permitir Thunder Client y Postman en desarrollo
const corsOptions = {
  origin: [
    'https://thepoint.netlify.app', // Frontend en producción
    'http://localhost:5173', // Frontend en local
    '*' // Permitir cualquier origen (para pruebas en Thunder Client y Postman)
  ],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true, // Permitir cookies y autenticación basada en tokens
};

// Aplicar CORS
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejar preflight OPTIONS

// Middleware para parsear JSON y solicitudes URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware para logs en consola
app.use(morgan('dev'));

// Configuración de Socket.io
const io = new Server(server, {
  cors: corsOptions
});

// Hacer que `io` esté disponible en toda la aplicación
app.locals.io = io;

io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Puedes enviar eventos desde el backend al frontend
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Montar rutas
app.use('/Pagos', routerPagos);
app.use('/Productos', routerProductos);
app.use('/Ventas', routerVentas);

// Ruta de prueba para confirmar que el servidor está funcionando
app.get('/', (req, res) => {
  res.status(200).json({ message: "Servidor funcionando correctamente" });
});

// Manejo de errores global para evitar bloqueos inesperados
app.use((err, req, res, next) => {
  console.error("❌ Error en la solicitud:", err);
  res.status(500).json({ message: "Error interno del servidor", error: err.message });
});

// Iniciar servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});

// Conectar a la base de datos
dbConnect()
  .then(() => {
    console.log('✅ Conectado a la base de datos');
  })
  .catch(error => {
    console.error('❌ Error al conectar con la base de datos:', error);
  });
