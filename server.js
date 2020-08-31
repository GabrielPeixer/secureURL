const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
const port = process.env.PORT || 3000
const Users = require('./routes/Users')
const File = require('./routes/File')

app.use(bodyParser.json())
app.use(cors())
app.use(
    bodyParser.urlencoded({
        extended: false
    })
)

app.use('/users', Users)

app.use('/file', File)

app.listen(port, function () {
    console.log('Server is running on port: ' + port)
})