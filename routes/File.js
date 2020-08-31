const express = require('express')
const file = express.Router()
const cors = require('cors')
const multipart = require('connect-multiparty');
const multipartMiddleware = multipart({ uploadDir: './utils/file-handler' });
const { check, validationResult } = require('express-validator');

const decodeIterator = require('../utils/desofuscador/desofuscador');

const fs = require('fs');
const readline = require('readline');
const { once } = require("events");

const multer = require("multer");

file.use(cors())

file.post('/deobfuscateString', [
    check('text', 'Insira um texto')
        .notEmpty(),
], (req, res) => {

    const obfuscateString = req.body.valor;

    try {
        const deobfuscateString = decodeIterator(obfuscateString);
        res.status(200).send({ deobfuscateString: deobfuscateString });
    } catch {
        res.status(500).send({
            error: 'error deobfuscateString string',
            deobfuscateString: deobfuscateString
        });
    }

});



const upload = multer({
    dest: './utils/file-handler',
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.includes('log') && file.mimetype != 'text/plain') {
            // return cb(new Error('Inválido, tente outro formato.'));
            req.fileValidationError = "Inválido, tente outro formato.";
            return cb(null, false, req.fileValidationError);
        }
        cb(null, true);
    }
}).single('file')


file.post('/upload', (req, res, next) => {
    upload(req, res, async (err) => {
        if (req.fileValidationError) {
            res.send('alertInvalido')
        }
        if (err) {
            console.log(err);
        }
        const file = req.file
        const path = await arquivo(file);
        if (!file) {
            const error = new Error('Please upload a file')
            error.httpStatusCode = 400
            return next(error)
        } else {
            const path = await arquivo(file);
            if (path) {
                res.download(path, file.originalname);
                res.send(file)
            } else {
                console.log('erro no arquivo');
                res.status(500).send({ erro: 'erro no arquivo' });
            }
        }
        // res.send(file)
    })
})

async function arquivo(file) {
    if (file.filename) {
        var outpath = `./utils/file-handler/${file.filename}`;
    }
    const writeStream = fs.createWriteStream(outpath, {
        flags: 'a'
    });

    writeStream.on('error', (err) => {
        console.log(err);
        throw err;
    });

    const readInterface = readline.createInterface({
        input: fs.createReadStream(file.path)
    });

    readInterface.on('line', (line) => {
        writeStream.write(`${decodeIterator(line)}\n`);
    });

    readInterface.on('close', () => {
        writeStream.end();
    });

    await once(writeStream, 'finish');

    return outpath;
}



module.exports = file