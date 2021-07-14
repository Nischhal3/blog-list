const Blog = require('../models/blog');
const User = require('../models/user');
const blogRouter = require('express').Router();
const jwt = require('jsonwebtoken');

// const getTokenFrom = request => {
//     const authorization = request.get('authorization');
//     if (authorization && authorization.toLowerCase().startsWith('bearer')) {
//         return authorization.substring(7)
//     }
//     return null
// }

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({}).populate('user', { username: 1, name: 1 });
    response.json(blogs.map(blog => blog.toJSON()));
})

blogRouter.post('/', async (request, response, next) => {
    const body = request.body;
    //console.log('body', body);
    const user = request.user;
    //console.log('User', user);

    if (!body.title || !body.author) {
        response.status(400).json({ error: "title or author name is missing!" });
    } else {
        if (!body.likes) {
            body.likes = 0;
        }

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        })

        const savedBlog = await blog.save();
        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.json(savedBlog.toJSON());
    }
})

blogRouter.get('/:id', async (request, response) => {
    const blog = await Blog.findById(request.params.id)
    if (blog) {
        response.json(blog.toJSON())
    } else {
        response.status(404).end()
    }
})

blogRouter.delete('/:id', async (request, response, next) => {
    const user = request.user;
    const blogToDelete = await Blog.findById(request.params.id);

    if (user._id.toString() === blogToDelete.user.toString()) {
        const deletedBlog = await blogToDelete.delete();
        //console.log(deletedBlog);
        response.status(204).end();
    }
})

blogRouter.put('/:id', async (request, response, next) => {
    const body = request.body;
    const user = request.user;
    const blogToDelete = await Blog.findById(request.params.id);

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    if (user._id.toString() === blogToDelete.user.toString()) {
        const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog)
        response.status(200).end();
    }
})

module.exports = blogRouter;