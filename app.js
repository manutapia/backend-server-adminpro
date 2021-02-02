// Requires
let express = require("express");
let bodyParser = require('body-parser');
let cors = require('cors')
let mongoose = require("mongoose");

// Inicializar variables
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuarios');
let loginRoutes = require('./routes/login')
let hospitalRoutes = require('./routes/hospitales')
let medicoRoutes = require('./routes/medicos');
let busquedaRoutes = require('./routes/busqueda');
let uploadRoutes = require('./routes/upload');
let imagenesRoutes = require('./routes/imagenes')

// Conexión a la base de datos
const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true // OJO a producción (ver doc)
};
mongoose.connect('mongodb://localhost:27017/hospitalDB', options, (err, res) => {
    if (err) throw err;
    console.log('Base de datos:  \x1b[32m%s\x1b[0m', 'online');
});

// Serve index config
// const serveIndex = require('serve-index');
// app.use(express.static(__dirname + '/'));
// app.use('/uploads', serveIndex(__dirname + '/uploads'))

let app = express();

app.use(cors())

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Rutas
app.use('/usuarios', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospitales', hospitalRoutes);
app.use('/medicos', medicoRoutes);
app.use('/busqueda', busquedaRoutes)
app.use('/upload', uploadRoutes);
app.use('/img', imagenesRoutes);
app.use('/', appRoutes);


// Escuchar peticiones.
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});