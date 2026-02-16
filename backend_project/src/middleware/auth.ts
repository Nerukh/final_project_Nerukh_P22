import jwt from 'jsonwebtoken';
import { Context, Next } from 'koa';

const SECRET = '2211';

export async function authMiddleware(ctx: Context, next: Next) {
    const authHeader = ctx.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.status = 401;
        ctx.body = { error: 'Авторизація обов’язкова (Bearer токен відсутній)' };
        return;
    }

    const token = authHeader.split(' ')[1];

    try {
        ctx.state.user = jwt.verify(token, SECRET);
        await next();
    } catch (err) {
        ctx.status = 403;
        ctx.body = { error: 'Недійсний або прострочений токен' };
    }
}