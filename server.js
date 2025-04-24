const express = require('express');
const bodyParser = require('body-parser');
const mainRoutes = require('./routes/main');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use('/', mainRoutes);

app.listen(port, () => {
    console.log(`Сервер запущено на http://localhost:${port}`);
});
