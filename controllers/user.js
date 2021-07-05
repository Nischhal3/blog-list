const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {
    const body = request.body;

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(body.password, saltRounds);

    if (!body.username || !body.password) {
        response.status(401).json({ error: "missing username or password" })
    } else {
        if (body.username.length <= 3 || body.password.length <= 3) {
            response.status(401).json({ erro: "username or password length too small" })
        } else {
            const user = new User({
                username: body.username,
                name: body.name,
                passwordHash,
            })

            const savedUser = await user.save();

            response.json(savedUser);
        }
    }
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({});
    response.json(users.map(user => user.toJSON()));
})

module.exports = usersRouter;