const { response } = require('express');
const Blog = require('../models/blog');
const blogRouter = require('express').Router();

blogRouter.get('/', (request, response) => {
    Blog.find({}).then(blogs => {
        response.json(blogs.map(blog => blog.toJSON()))
    })
})

blogRouter.post('/', (request, response) => {
    const body = request.body;

    const blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes
    })

    if (!blog.title || !blog.author || !blog.likes) {
        response.status(400).end();
    } else {
        blog
            .save()
            .then(savedBlog => {
                response.json(savedBlog.toJSON());
            })
            .catch(error => next(error));
    }
})

blogRouter.get('/:id', (request, response) => {
    Blog.findById(request.params.id)
        .then(blog => {
            if (blog) {
                response.json(blog.toJSON())
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

blogRouter.delete('/:id', (request, response, next) => {
    Blog.findByIdAndDelete(request.params.id)
        .then(() => {
            response.status(204).end();
        })
        .catch(error => next(error));
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