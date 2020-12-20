import express from 'express'
import http from 'http';
import bodyParser from 'body-parser'
import path from 'path'
import { app } from './server'

const httpServer = http.createServer(app)

// Serving static files
app.use('/assets', express.static(path.resolve(__dirname, 'assets')));
app.use('/game/assets', express.static(path.resolve(__dirname, 'assets')));
// for parsing application/json
app.use(bodyParser.json());
// hide powered by express
app.disable('x-powered-by');

// start the server
httpServer.listen(process.env.PORT || 3000);

