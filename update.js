const express = require('express')
const serveIndex = require('serve-index')
const helmet = require('helmet')
const http = require('http')
const app = express()

try {
  app.use(function (req, res, next) {
    let error = null
    try {
      decodeURIComponent(req.path)
    } catch (e) {
      error = e
    }
    if (error) {
      logger.log('error', error)
      return res.redirect('/')
    }
    next()
  })
  const httpServer = http.createServer(app)
  app.use(helmet())
  app.use('/update', express.static('update'), serveIndex('update'))
  httpServer.listen(3001, () => {})
} catch (err) {
  console.log(err)
}
