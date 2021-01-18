const express = require('express');
const Hospital = require('../models/hospital')
const mdAutenticacion = require('../moddlewares/autenticacion');

const app = express();

app.get('/', (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde)
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitalesDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: err
                })
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    hospitalesDB,
                    total: conteo
                });
            })
        })
})

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            })
        };
        if (!hospitalDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con el id: ' + id,
                errors: { message: 'no existe ningun hospital con ese id' }
            })
        };

        hospitalDB.nombre = body.nombre;
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                })
            };

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            })
        })
    })
})

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;

    const hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear el hospital',
                errors: err
            })
        }
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })
    })
});

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    Hospital.findOneAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            })
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'no existe ningun hospital con ese id' }
            })
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        })
    })
})

module.exports = app;