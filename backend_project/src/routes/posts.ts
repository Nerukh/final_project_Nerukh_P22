import Router from 'koa-router';
import { Post } from '../models/Post';
import { authMiddleware } from '../middleware/auth';
import { validateDto } from '../untils/validateDto';
import { PostDto } from '../dto/PostDto';

const router = new Router();

router.get('/all', async ctx => {
    try {
        const posts = await Post.find().sort({ created_at: -1 });
        ctx.body = posts;
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: "Помилка сервера при отриманні даних" };
    }
});

router.post('/', authMiddleware, validateDto(PostDto), async ctx => {
    const data = ctx.request.body as PostDto;
    const user = ctx.state.user;

    try {
        const post = new Post({
            ...data,
            author: user.id,
            user_email: user.username
        });

        await post.save();
        ctx.status = 201;
        ctx.body = post;
    } catch (err) {
        console.error("Помилка збереження поста:", err);
        ctx.status = 400;
        ctx.body = { error: "Не вдалося зберегти пост. Перевірте формат даних." };
    }
});

router.put('/:id', validateDto(PostDto), async ctx => {
    const { id } = ctx.params;
    const data = ctx.request.body as PostDto;

    try {
        const post = await Post.findById(id);
        if (!post) {
            ctx.status = 404;
            ctx.body = { error: "Пост не знайдено" };
            return;
        }

        Object.assign(post, data);
        await post.save();

        ctx.body = post;
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: "Помилка при оновленні" };
    }
});

router.delete('/:id', async ctx => {
    const { id } = ctx.params;

    try {
        const post = await Post.findById(id);
        if (!post) {
            ctx.status = 404;
            ctx.body = { error: "Пост не знайдено" };
            return;
        }

        await post.deleteOne();
        ctx.body = { message: "Пост видалено без авторизації" };
    } catch (err) {
        ctx.status = 500;
        ctx.body = { error: "Помилка при видаленні" };
    }
});

export default router;