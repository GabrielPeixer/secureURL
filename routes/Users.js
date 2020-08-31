const express = require('express')
const nodemailer = require("nodemailer");
const authEmail = require('../authEmail.json')
const users = express.Router()
const cors = require('cors')
const jwt = require('jsonwebtoken')

const User = require('../models/User')
users.use(cors())

process.env.SECRET_KEY = 'secret'

users.post('/login', (req, res) => {
    User.findOne({
        where: {
            email: req.body.email,
            password: req.body.password
        }
    })
        .then(user => {
            if (user) {
                let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                    expiresIn: 1440
                })
                res.json({ token: token })
            } else {
                res.send('Usuario nao existe')
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})

users.post('/register', (req, res) => {
    const today = new Date()
    const userData = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        created: today
    }

    User.findOne({
        where: {
            email: req.body.email
        }
    })

        .then(user => {
            if (!user) {
                User.create(userData)
                    .then(user => {
                        let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                            expiresIn: 1440
                        })
                        res.json({ token: token })
                    })
                    .catch(err => {
                        res.send('error: ' + err)
                    })
            } else {
                res.json({ error: 'Usuario ja existe' })
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})


users.get('/profile', (req, res) => {
    var decoded = jwt.verify(req.headers['authorization'], process.env.SECRET_KEY)

    User.findOne({
        where: {
            id: decoded.id
        }
    })
        .then(user => {
            if (user) {
                res.json(user)
            } else {
                res.send('Usuario nao existe')
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})

users.get('/profileAll', (req, res) => {

    User.findAll({}).map(el => el.get({ plain: true }))
        .then(users => {
            if (users) {
                res.json(users)
            } else {
                res.send('Nenhum usuario na tabela')
            }
        })
        .catch(err => {
            res.send('error: ' + err)
        })
})

users.patch('/profileUpdate/:id', (req, res) => {
    const today = new Date()
    const userData = {
        id: req.body.id,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        password: req.body.password,
        created: today
    }

    User.find({
        where: { id: req.body.id }
    })
        .then(user => {
            let token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                expiresIn: 1440
            })
            res.json({ token: token })

            return user.updateAttributes(userData)
        });
});

users.delete('/deleteProfile/:id', (req, res) => {

    User.destroy({
        where: { id: req.body.id }
    })
        .then(deletedUser => {
            console.log(`ID do usuario deletado: ${deletedUser}`);
        })
        .catch(err => {
            res.send('error: ' + err)
        })

});

users.post("/sendmail", (req, res) => {
    console.log("request came");
    let user = req.body;
    sendMail(user, info => {
        res.send(info);
    });
});

async function sendMail(user, callback) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // Verdadeiro para 465
        auth: {
            user: authEmail.email,
            pass: authEmail.password
        }
    });

    let mailOptions = {
        from: authEmail.email,
        to: user.email,
        subject: user.subject,
        html: user.html
    };

    // send mail with defined transport object
    let info = await transporter.sendMail(mailOptions);

    callback(info);
}

module.exports = users
