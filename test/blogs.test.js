const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const helper = require('./test_helper');
const Blog = require('../models/blog');

describe("when there are only three blogs", () => {
    beforeEach(async () => {
        await Blog.deleteMany({});
        await Blog.insertMany(helper.initialBlogs);
    })

    test("blogs are returned as json", async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test("all blogs are returned ", async () => {
        const response = await api.get('/api/blogs');
        //console.log(response.body);
        expect(response.body).toHaveLength(helper.initialBlogs.length)
    })

    test("blogs are identified by id", async () => {
        const response = await api.get('/api/blogs');
        const id = response.body.map(blog => blog.id);
        //console.log(id);
        expect(id).toBeDefined(response.body._id);
    })

    describe("adding a new blog", () => {
        test("a valid blog can be added", async () => {
            const newBlog = {
                title: "Journey to West",
                author: "Shilpa",
                likes: 44,
                url: "www.fakeUrl.com"
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)
                .expect("Content-Type", /application\/json/)

            const response = await api.get('/api/blogs');

            expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
        })

        test("invalid blog is not added", async () => {
            const newBlog = {
                likes: 44,
                url: "www.fakeUrl.com"
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(400)

            const response = await api.get('/api/blogs');

            expect(response.body).toHaveLength(helper.initialBlogs.length);
        })
    })
})

afterAll(() => {
    mongoose.connection.close();
})

/* test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);
    expect(result).toBe(1);
})

describe('total likes', () => {
    const blogs = [
        {
            _id: "5a422a851b54a676234d17f7",
            title: "React patterns",
            author: "Michael Chan",
            url: "https://reactpatterns.com/",
            likes: 7,
            __v: 0
        },
        {
            _id: "5a422aa71b54a676234d17f8",
            title: "Go To Statement Considered Harmful",
            author: "Edsger W. Dijkstra",
            url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
            likes: 5,
            __v: 0
        },
        {
            _id: "5a422b891b54a676234d17fa",
            title: "First class tests",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
            likes: 10,
            __v: 0
        },
        {
            _id: "5a422ba71b54a676234d17fb",
            title: "TDD harms architecture",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
            likes: 0,
            __v: 0
        },
        {
            _id: "5a422bc61b54a676234d17fc",
            title: "Type wars",
            author: "Robert C. Martin",
            url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
            likes: 2,
            __v: 0
        },
        {
            _id: "5a422b3a1b54a676234d17f9",
            title: "Canonical string reduction",
            author: "Edsger W. Dijkstra",
            url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
            likes: 12,
            __v: 0
        }
    ]

    test('total likes of the blogs', () => {
        const result = listHelper.totalLikes(blogs);
        expect(result).toBe(36);
    })

    test('Favorite Blog', () => {
        const result = listHelper.favorite(blogs);
        expect(result.likes).toEqual(12);
        console.log(result);
    })
}) */