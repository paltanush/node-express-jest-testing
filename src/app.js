const express = require('express')
require('./db/connection')
const chalk = require('chalk')
const userRouter = require('./router/user')

const app = express();
app.use(express.json())
app.use(userRouter)

module.exports = app