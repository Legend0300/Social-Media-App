const express = require('express');
const connect = require('./config/dbConnection');
bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
app.use(bodyParser.json());
const postRouter = require('./routes/post');
const storyRouter = require('./routes/story');
const userRouter = require('./routes/user');

app.use(cors());
app.use(express.json());

app.use('/posts', postRouter);
app.use('/stories', storyRouter);
app.use('/users', userRouter);



app.use(express.static('public'));

connect();


app.get('/', (req, res) => {
    res.send("Hello World!");
});

app.listen(3000, () => 
console.log('Server listening on port 3000!'
));

