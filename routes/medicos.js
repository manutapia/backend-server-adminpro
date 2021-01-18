const express = require('express')
const mdAutenticacion = require('../moddlewares/autenticacion');
const Medico = require('../models/medico');

const app = express();

app.get('/', (req, res) => {
    let desde = req.query.desde || 0;
    desde = Number(desde)
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicosDB) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                })
            }
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicosDB,
                    total: conteo
                });
            })
        })
})

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    const id = req.params.id;
    const body = req.body;

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            })
        };
        if (!medicoDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con el id: ' + id,
                errors: { message: 'no existe ningun medico con ese id' }
            })
        };

        medicoDB.nombre = body.nombre;

        medicoDB.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el medico',
                    errors: err
                })
            };

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            })
        })
    })
})

app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    const body = req.body;
    const medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body._idhospital
    });

    medico.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al actualizar hospital',
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
    Medico.findOneAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            })
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'no existe ningun medico con ese id' }
            })
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        })
    })
})

module.exports = app;