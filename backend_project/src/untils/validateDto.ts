import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Context, Next } from 'koa';

export function validateDto(dtoClass: any) {
    return async (ctx: Context, next: Next) => {
        const instance = plainToInstance(dtoClass, ctx.request.body);

        const errors = await validate(instance as object);

        if (errors.length > 0) {
            ctx.status = 400;
            ctx.body = { error: 'Помилка валідації', details: errors };
            return;
        }
        await next();
    };
}