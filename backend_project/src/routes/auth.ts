import Router from 'koa-router';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { validateDto } from '../untils/validateDto';
import { RegisterDto } from '../dto/RegisterDto';
import { LoginDto } from '../dto/LoginDto';

const router = new Router();
const SECRET = '2211';


router.get('/users', async ctx => {
    try {
        const users = await User.find({}, 'username password email');
        ctx.body = users;
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: 'Помилка сервера' };
    }
});


router.get('/users/:id', async ctx => {
    try {
        const user = await User.findById(ctx.params.id, 'username email');
        if (!user) {
            ctx.status = 404;
            ctx.body = { error: 'Користувача не знайдено' };
            return;
        }
        ctx.body = user;
    } catch (err) {
        ctx.status = 400;
        ctx.body = { error: 'Невірний формат ID' };
    }
});


router.patch('/users/:id', async ctx => {
    try {
        const updatedUser = await User.findByIdAndUpdate(
            ctx.params.id,
            ctx.request.body as any,
            { new: true }
        );

        if (!updatedUser) {
            ctx.status = 404;
            ctx.body = { error: 'Користувача не знайдено' };
            return;
        }

        ctx.body = { message: 'Дані оновлено', user: updatedUser };
    } catch (err) {
        ctx.status = 400;
        ctx.body = { error: 'Не вдалося оновити. Перевір формат ID.' };
    }
});


router.delete('/users/:id', async ctx => {
    try {
        await User.findByIdAndDelete(ctx.params.id);
        ctx.body = { message: 'Користувача видалено' };
    } catch (err) {
        ctx.status = 400;
        ctx.body = { error: 'Помилка при видаленні' };
    }
});


router.post('/register', validateDto(RegisterDto), async ctx => {
    const { username, password } = ctx.request.body as RegisterDto;
    const exists = await User.findOne({ username });
    if (exists) {
        ctx.status = 400;
        ctx.body = { error: 'Користувач вже існує' };
        return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET);
    ctx.body = {
        token,
        message: 'Успішна реєстрація'
    };
});

router.post('/login', validateDto(LoginDto), async ctx => {
    const { username, password } = ctx.request.body as LoginDto;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        ctx.status = 401;
        ctx.body = { error: 'Невірний логін або пароль' };
        return;
    }
    const token = jwt.sign({ id: user._id, username: user.username }, SECRET);
    ctx.body = { token };
});

export default router;