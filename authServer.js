require("dotenv").config();

const { request } = require("express");
const express = require("express");
const app = express();
const jwtoken = require("jsonwebtoken");

app.use(express.json());

let refreshTokens = [];

app.post("/token", (request, response)=> {
    const refreshToken = request.body.token;

    if (refreshToken == null) {
        response.json({"message" : "Bad Token"});
        return response.sendStatus(401);
    }
    if (!refreshTokens.includes(refreshToken)) {
        response.json({"message" : "Bad Token"});
        return response.sendStatus(403);
    }

    jwtoken.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) {
            response.json({"message" : "Bad Token"});
            return response.sendStatus(403);
        }
        const accessToken = generateAccessToken({ name: user.name });
        response.json({ accessToken: accessToken });
    })
});

app.delete("/logout", (request, response) => {
    refreshTokens = refreshTokens.filter(token => token !== request.body.token);
    response.sendStatus(204);
    response.json({"message" : "Logged out"});
});

app.post("/login", (request, response) => {
    // auth user
    const username = request.body.username;
    const user = { name: username };

    const accessToken = generateAccessToken(user);
    const refreshToken = jwtoken.sign(user, process.env.REFRESH_TOKEN_SECRET);
    refreshTokens.push(refreshToken);

    response.json({ accessToken: accessToken, refreshToken: refreshToken });
});

function generateAccessToken(user) {
    return jwtoken.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '30s' });
}

app.listen(4000)