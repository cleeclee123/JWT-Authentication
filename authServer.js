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
        return response.sendStatus(401);
    }
    if (!refreshTokens.includes(refreshToken)) {
        return response.sendStatus(403);
    }

    jwtoken.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (error, user) => {
        if (error) {
            return response.sendStatus(403);
        }
        const accessToken = generateAccessToken({ name: user.name });
        response.json({ accessToken: accessToken });
    })
});

app.delete("/logout", (request, response) => {
    refreshTokens = refreshTokens.filter(token => token !== request.body.token);
    response.sendStatus(204);
});

function generateAccessToken(user) {
    return jwtoken.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15s' });
}