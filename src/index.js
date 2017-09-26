import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import api from './api';


let app = express();
app.server = http.createServer(app);

app.use(morgan('dev'));

app.use(cors())

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use('/', api());

app.use(errorHandler);

function errorHandler(err, req, res, next) {
    if (err) {
        res.status(400).json({ "error": 1, "message": err, "data": "" });
    }
}

app.server.listen(process.env.PORT || 3015, () => {
    console.log(`Started on port ${app.server.address().port}`);
});