const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const app = require('../app');

const api = supertest(app);
const helper = require('./test_helper');
const Blog = require('../models/blog');
const User = require('../models/user');

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
                //userId missing
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

        test("if no likes blog like is equal to 0", async () => {
            const newBlog = {
                title: "My life",
                author: "Biswas",
                url: "https://fullstackopen.com/osa4/sovelluksen_rakenne_ja_testauksen_alkeet#sovelluksen-rakenne",
                id: "60c1c98b66c3f8d0fa27822a"
            }

            await api
                .post('/api/blogs')
                .send(newBlog)
                .expect(200)

            const response = await api.get('/api/blogs');

            expect(response.body).toHaveLength(helper.initialBlogs.length + 1);
        })
    })

    describe("deleting a blog", () => {
        test("deleting blog having valid id ", async () => {
            const blogs = await helper.blogsInDb();
            const blogToDelete = blogs[2];
            await api
                .delete(`/api/blogs/${blogToDelete.id}`)
                .expect(204)

            const blogsAtEnd = await helper.blogsInDb();

            expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1);

            const blogTitle = blogsAtEnd.map(blog => blog.title);

            expect(blogTitle).not.toContain(blogToDelete.title);
        })
    })

    describe("updating a blog", () => {
        test("updating a blog having valid id", async () => {
            const blogs = await helper.blogsInDb();
            const blogToUpdate = blogs[2];
            //console.log(blogToUpdate.id);

            const updatedBlog = {
                title: "Canonical string reduction",
                author: "Edsger W. Dijkstra",
                url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
                likes: 18,
            }

            await api
                .put(`/api/blogs/${blogToUpdate.id}`)
                .send(updatedBlog)
                .expect(200)

            const blogsAtEnd = await helper.blogsInDb();
            const testBlog = blogsAtEnd[2];

            expect(updatedBlog.likes).toBe(testBlog.likes);
        })
    })
})

describe('when there is initially one user at db', () => {
    beforeEach(async () => {
        await User.deleteMany({})

        const passwordHash = await bcrypt.hash('sekret', 10)
        const user = new User({ username: 'root', passwordHash })

        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
        const usersAtStart = await helper.usersInDb()

        const newUser = {
            username: 'mluukkai',
            name: 'Matti Luukkainen',
            password: 'salainen',
        }

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

        const usernames = usersAtEnd.map(u => u.username)
        expect(usernames).toContain(newUser.username)
    })

    test("username must be unique", async () => {
        const usersAtStart = await helper.usersInDb();

        const newUser = {
            username: "root",
            name: "Superuser",
            password: "salainen"
        }

        const result = await api
            .post('/api/users')
            .send(newUser)
            .expect(400)
            .expect("Content-Type", /application\/json/)

        expect(result.body.error).toContain('`username` to be unique');

        const usersAtEnd = await helper.usersInDb();
        expect(usersAtEnd).toHaveLength(usersAtStart.length);
    })

    describe("username or password must be valid", () => {
        test("username is missing", async () => {
            const usersAtStart = await helper.usersInDb();

            const newUser = {
                username: "",
                name: "Biswas",
                password: "gole"
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(401)
                .expect("Content-Type", /application\/json/)

            const usersAtEnd = await helper.usersInDb();
            expect(usersAtEnd).toHaveLength(usersAtStart.length);
        })

        test("password is missing", async () => {
            const usersAtStart = await helper.usersInDb();

            const newUser = {
                username: "gole",
                name: "Biswas",
                password: ""
            }

            await api
                .post('/api/user')
                .send(newUser)
                .expect(404)
                .expect("Content-Type", /application\/json/)

            const usersAtEnd = await helper.usersInDb();
            expect(usersAtEnd).toHaveLength(usersAtStart.length);
        })

        test("username length must be more than 3", async () => {
            const usersAtStart = await helper.usersInDb();

            const newUser = {
                username: "gag",
                name: "Shilpa",
                password: "random"
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(401)
                .expect("Content-Type", /application\/json/)

            const usersAtEnd = await helper.usersInDb();
            expect(usersAtEnd).toHaveLength(usersAtStart.length);
        })

        test("password length must be more than 3", async () => {
            const usersAtStart = await helper.usersInDb();

            const newUser = {
                username: "shilpa",
                name: "Shilpa",
                password: "gag"
            }

            await api
                .post('/api/users')
                .send(newUser)
                .expect(401)
                .expect("Content-Type", /application\/json/)

            const usersAtEnd = await helper.usersInDb();
            expect(usersAtEnd).toHaveLength(usersAtStart.length);
        })
    })
})

afterAll(() => {
    mongoose.connection.close();
})