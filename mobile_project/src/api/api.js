import axios from 'axios';

const API = axios.create({
  baseURL: 'http://192.168.0.221:3000',
});

export const loginUser = (email, password) => API.post('/auth/login', { username: email, password });
export const registerUser = (email, password) => API.post('/auth/register', { username: email, password });

export const getAllPosts = async () => {
  const response = await API.get('/posts/all');
  return response.data;
};

export const createPost = async (postData, token) => {
  const response = await API.post('/posts', postData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updatePost = async (id, postData, token) => {
  const response = await API.put('/posts/${id}', postData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const deletePost = async (id, token) => {
  const response = await API.delete('/posts/${id}', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getAllUsers = () => API.get('/auth/users');
export const getUserById = (id) => API.get('/auth/users/${id}');
export const updateUser = (id, data) => API.patch('/auth/users/${id}', data);
export const deleteUser = (id) => API.delete('/auth/users/${id}');

export default API;


