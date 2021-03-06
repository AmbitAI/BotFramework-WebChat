require('dotenv').config();

import * as dl from "../../node_modules/ambit-directlinejs/built/directLine";
import * as express from 'express';
import bodyParser = require('body-parser');
import * as path from 'path';
import * as fs from 'fs';

const config = require('../mock_dl/server_config.json') as { bot: dl.User, port: number, widthTests: { [id: string]: number } };
const app = express();

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    next();
});

const timeout = 60 * 1000;
const conversationId = "mockversation";
const expires_in = 1800;
const streamUrl = "http://nostreamsupport";
const simpleCard = {
    "$schema": "https://microsoft.github.io/AdaptiveCards/schemas/adaptive-card.json",
    "type": "AdaptiveCard",
    "body": []
};

const get_token = (req: express.Request) =>
    (req.header("authorization") || "works/all").split(" ")[1];

const sendExpiredToken = (res: express.Response) => {
    res.status(403).send({ error: { code: "TokenExpired" } });
}

const sendStatus = (res: express.Response, code: string) => {
    const num = Number(code);
    if (isNaN(num))
        res.send(500).send("Mock Failed; unknown test");
    else
        res.status(num).send();
}

app.post('/mock/tokens/generate', (req, res) => {
    const token = get_token(req);

    res.send({
        conversationId,
        token,
        expires_in,
        timestamp: new Date().toUTCString(),
    });
});

app.post('/mock/tokens/refresh', (req, res) => {
    const token = get_token(req);

    res.send({
        conversationId,
        token,
        expires_in,
        timestamp: new Date().toUTCString()
    });
});

let counter: number;
let messageId: number;
let queue: dl.Activity[];

app.post('/mock/conversations', (req, res) => {
    counter = 0;
    queue = [];
    messageId = 0;
    const [test, area] = get_token(req).split("/");
    if (test === 'works' || area !== 'start')
        startConversation(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => startConversation(req, res), timeout);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const startConversation = (req: express.Request, res: express.Response) => {
    const token = get_token(req);
    const [test, area] = token.split("/");

    res.send({
        conversationId,
        token,
        expires_in,
        streamUrl,
        timestamp: new Date().toUTCString()
    });
    sendActivity(res, {
        type: "message",
        text: "Welcome to MockBot!",
        timestamp: new Date().toUTCString(),
        from: config.bot
    });
}

const sendActivity = (res: express.Response, activity: dl.Activity) => {
    queue.push(activity)
}

app.post('/mock/conversations/:conversationId/activities', (req, res) => {
    const token = get_token(req);
    const [test, area, count] = token.split("/");
    if (test === 'works' || area !== 'post' || !count || ++counter < Number(count))
        postMessage(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => postMessage(req, res), timeout);
            return;
        case 'expire':
            sendExpiredToken(res);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const postMessage = (req: express.Request, res: express.Response) => {
    const id = messageId++;
    res.send({
        id,
        timestamp: new Date().toUTCString()
    });
    processCommand(req, res, req.body.text, id);
}

const printCommands = () => {
    let cmds = "### Commands\r\n\r\n";
    for (var command in commands) {
        cmds += `* ${command}\r\n`;
    }
    return cmds;
}

// Getting testing commands from map and server config
const commands = require('../commands_map');

const processCommand = (req: express.Request, res: express.Response, cmd: string, id: number) => {

    if (commands[cmd] && commands[cmd].server) {
        //look for "card ..." prefix on command
        const cardsCmd = /card[ \t]([^ ]*)/g.exec(cmd);
        if (cardsCmd && cardsCmd.length > 0) {
            const cardName = cardsCmd[1];
            getCardJsonFromFs(cardName).then(cardJson => {
                //execute the server, with the card json from the file system
                commands[cmd].server(res, sendActivity, cardJson);
            }).catch((err) => { throw err });
        } else {
            //execute the server
            commands[cmd].server(res, sendActivity);
        }
    } else {
        switch (cmd) {
            case 'help':
                sendActivity(res, {
                    type: "message",
                    timestamp: new Date().toUTCString(),
                    channelId: "webchat",
                    text: printCommands(),
                    from: config.bot
                });
                return;
            case 'end':
                process.exitCode = 0;
                process.exit();
                return;
            default:
                sendActivity(res, {
                    type: "message",
                    timestamp: new Date().toUTCString(),
                    channelId: "webchat",
                    text: "echo: " + req.body.text,
                    from: config.bot
                });
                return;
        }
    }
}


app.post('/mock/conversations/:conversationId/upload', (req, res) => {
    const token = get_token(req);
    const [test, area, count] = token.split("/");
    if (test === 'works' || area !== 'upload' || !count || ++counter < Number(count))
        upload(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => upload(req, res), timeout);
            return;
        case 'expire':
            sendExpiredToken(res);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const upload = (req: express.Request, res: express.Response) => {
    const id = messageId++;
    res.send({
        id,
        timestamp: new Date().toUTCString()
    });
}

app.get('/mock/conversations/:conversationId/activities', (req, res) => {
    const token = get_token(req);
    const [test, area, count] = token.split("/");
    if (test === 'works' || area !== 'get' || !count || ++counter < Number(count))
        getMessages(req, res);
    else switch (test) {
        case 'timeout':
            setTimeout(() => getMessages(req, res), timeout);
            return;
        case 'expire':
            sendExpiredToken(res);
            return;
        default:
            // assume to be a status code
            sendStatus(res, test);
            return;
    }
});

const getMessages = (req: express.Request, res: express.Response) => {
    if (queue) {
        if (queue.length > 0) {
            const msg = queue.shift();
            const id = messageId++;
            msg.id = id.toString();
            msg.from = { id: "id", name: "name" };
            res.send({
                activities: [msg],
                watermark: id,
                timestamp: new Date().toUTCString()
            });
        } else {
            res.send({
                activities: [],
                watermark: messageId,
                timestamp: new Date().toUTCString()
            })
        }
    }
}

const getCardJsonFromFs = (fsName: string): Promise<any> => {
    return readFileAsync('./test/cards/' + fsName + '.json')
        .then(function (res) {
            return JSON.parse(res);
        });
}

const readFileAsync = (filename: string): Promise<any> => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, result) => {
            if (err) reject(err);
            else resolve(result);
        });
    });
}
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + "/../test.html"));
});
app.get('/botchat.js', function (req, res) {
    res.sendFile(path.join(__dirname + "/../../botchat.js"));
});
app.get('/botchat.css', function (req, res) {
    res.sendFile(path.join(__dirname + "/../../botchat.css"));
});
app.get('/botchat-fullwindow.css', function (req, res) {
    res.sendFile(path.join(__dirname + "/../../botchat-fullwindow.css"));
});
app.get('/mock_speech.js', function (req, res) {
    res.sendFile(path.join(__dirname + "/../mock_speech/index.js"));
});
app.get('/assets/:file', function (req, res) {
    const file = req.params["file"];
    res.sendFile(path.join(__dirname + "/../assets/" + file));
});

//do not listen unless being called from the command line
if (!module.parent) {

    // Running Web Server and DirectLine Client on port
    app.listen(process.env.port || process.env.PORT || config.port, () => {
        console.log('listening on ' + config.port);
    });
}
