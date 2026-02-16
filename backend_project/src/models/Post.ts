import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    title: { type: String, default: "Правопорушення" },
    text: { type: String, required: true },
    image: String,
    latitude: Number,
    longitude: Number,
    date: String,
    user_email: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now }
});

export const Post = mongoose.model('Post', postSchema);