const express = require('express');
const path = require('path');

const app = express();
let publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

let listeningPort = 8080;
console.log(`Listening on http://localhost:${listeningPort}/`);
app.listen(listeningPort);