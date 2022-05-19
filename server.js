require("dotenv").config();

const express = require("express");
const app = express();

const jwtoken = require("jsonwebtoken");

app.use(express.json());

const posts = [
    {
        username: "Chris",
        title: "test 1",
    },
    {
        username: "Nathan",
        title: "test 2",
    }
]


app.get("/posts", authToken, (request, response) => {
    response.json(posts.filter(post => post.username === request.user.name));
});

app.post("/login", (request, response) => {
    // authenticate user
    const username = request.body.username;
    const user = { name: username };

    // create jwt
    const acesssToken = jwtoken.sign(user, process.env.ACCESS_TOKEN_SECRET);
    response.json({ acesssToken: acesssToken });
});

function authToken(request, response, next) {
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token == null) {
        response.json({"message" : "Token does not exist"});
        return response.sendStatus(401);
    }
    jwtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, user) => {
        if (error) {
            response.json({"message" : "Bad Token"});
            return response.send(403);
        }
        request.user = user;
        next();
    });
}

app.listen(3000);