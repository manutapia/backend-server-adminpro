const express = require('express');
let app = express();
const Hospital = require('../models/hospital')
const Medico = require('../models/medico');
const Usuario = require('../models/usuario')

// ===============================================
//  BUSQUEDA ESPECIFICA
// ===============================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    const tabla = req.params.tabla;
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');
    const rows = [];
    switch (tabla) {
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex)
            break;
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda solo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no válido' }
            })
    }
    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        })
    })
})

// ===============================================
//  BUSQUEDA GENERAL
// ===============================================
app.get('/todo/:busqueda', (req, res) => {
    const busqueda = req.params.busqueda;
    const regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex)
    ]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    })
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitalesDB) => {
                if (err) {
                    reject('Error al cargar hospitales.', err);
                } else {
                    resolve(hospitalesDB)
                }

            })
    })
}

function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, medicosDB) => {
                if (err) {
                    reject('Error al cargar medicos.', err);
                } else {
                    resolve(medicosDB)
                }

            })
    })
}

function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, usuariosDB) => {
                if (err) {
                    reject('Error al cargar usuarios. ', err);
                } else {
                    resolve(usuariosDB)
                }
            })
    })
}

module.exports = app;