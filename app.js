const express = require('express');
const _ = require('lodash');

const app = express();
let publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

app.listen(8080);