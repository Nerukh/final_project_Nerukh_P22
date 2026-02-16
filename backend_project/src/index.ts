import 'reflect-metadata';
import Koa from 'koa';
import Router from 'koa-router';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import mongoose from 'mongoose';

import authRoutes from './routes/auth';
import postRoutes from './routes/posts';

const app = new Koa();
const router = new Router();

mongoose.connect('mongodb://127.0.0.1:27017/violation_app')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('DB Connection Error:', err));

app.use(cors());
app.use(bodyParser());

router.use('/auth', authRoutes.routes());
router.use('/posts', postRoutes.routes());

app.use(router.routes()).use(router.allowedMethods());

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});