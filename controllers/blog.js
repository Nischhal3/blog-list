const Blog = require('../models/blog');
const blogRouter = require('express').Router();

blogRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({});
    response.json(blogs.map(blog => blog.toJSON()));
})

blogRouter.post('/', async (request, response) => {
    const body = request.body;

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
            likes: body.likes
        })

        const savedBlog = await blog.save();
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
    const blog = await Blog.findByIdAndDelete(request.params.id)
    response.status(204).end();
})

blogRouter.put('/:id', (request, response, next) => {
    const body = request.body;

    const blog = {
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    }

    Blog.findByIdAndUpdate(request.params.id, blog)
        .then(updatedBlog => {
            response.json(updatedBlog.toJSON());
        })
        .catch(error => next(error));
})

module.exports = blogRouter;