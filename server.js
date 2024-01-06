const express = require('express');
const app = express();
const OpenAI = require("openai");
require('dotenv').config()
const {ACCESS_TOKEN_OPENAI} = process.env;

const staticHandler = express.static("public");
app.use(staticHandler);

const openai = new OpenAI({
    apiKey: ACCESS_TOKEN_OPENAI,
  });

app.use(express.urlencoded({ extended: true }));

let log = []

app.get('/', async (req, res) => {
    try {
        let logHtml = log.map(entry => {
            return `<div class="log-entry"><span style="font-weight: bold">${entry.role}</span>: ${entry.content}</div>`;
        }).join('');

        console.log(log);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Server Bot</title>
                <!-- Your CSS styles can be linked here -->
                <link rel="stylesheet" href="/style.css">
            </head>
            
            <body>
                <h1>Server Bot</h1>
                <div id="outer-container">
                    <div id="chat-container">
                        <div id="response-area">
                            ${logHtml}
                        </div>
                        <form id="chat-form" action="/submit-form" method="post">
                            <textarea id="userinput" name="userinput" placeholder="Type your message here"></textarea>
                            <button type="submit" id="submit-btn">Submit</button>
                        </form>
                    </div>
                </div>
            </body>
            </html>`
        );
    } catch (error) {
        // Handle the error here
        console.error(error);
        res.status(500).send(error.message);
    }
});

app.post('/submit-form', async (req, res) => {
    try {
        let userInput = req.body.userinput;

        log.push({ role: "user", content: userInput });

        const response = await openai.chat.completions.create({
            messages: log,
            model: "gpt-3.5-turbo",
            max_tokens: 320
        });

        log.push({ role: "system", content: response.choices[0].message.content });

        let logHtml = log.map(entry => {
            return `<div class="log-entry"><span style="font-weight: bold">${entry.role}</span>: ${entry.content}</div>`;
        }).join('');

        console.log(log);

        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Server Bot</title>
                <!-- Your CSS styles can be linked here -->
                <link rel="stylesheet" href="/style.css">
            </head>
            
            <body>
                <h1>Server Bot</h1>
                <div id="outer-container">
                    <div id="chat-container">
                        <div id="response-area">
                            ${logHtml}
                        </div>
                        <form id="chat-form" action="/submit-form" method="post">
                            <textarea id="userinput" name="userinput" placeholder="Type your message here"></textarea>
                            <button type="submit" id="submit-btn">Submit</button>
                        </form>
                    </div>
                </div>
            </body>
            </html>`
        );
    } catch (error) {
        // Handle the error here
        console.error(error);
        res.status(500).send(error.message);
    }
});



module.exports = app;