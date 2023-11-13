const express = require('express');
const connect = require('./config/dbConnection');
const cors = require('cors');
const bodyParser = require('body-parser');
const postRouter = require('./routes/post');
const storyRouter = require('./routes/story');
const userRouter = require('./routes/user');


const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.json());
const cookieParser = require('cookie-parser');

app.use(cookieParser());
app.use('/', postRouter);
app.use('/stories', storyRouter);
app.use('/users', userRouter);



app.use(express.static('public'));

connect();



app.listen(3000, () => 
console.log('Server listening on port 3000!'
));

