const express = require('express');
const connect = require('./config/dbConnection');
const app = express();

app.use(express.static('public'));

connect();


app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.listen(3000, () => 
console.log('Server listening on port 3000!'
));

