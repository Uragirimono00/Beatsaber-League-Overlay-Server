// ********* app.js 파일 
const ws = require('ws');
const https = require('http');
const fs = require('fs');

// 그루미님 서버용
// const options = {
//   ca: fs.readFileSync('/mnt/disk/cert.pem'),
//   key: fs.readFileSync('/mnt/disk/privkey.pem'),
//   cert: fs.readFileSync('/mnt/disk/fullchain.pem')
// };

// HTTP 서버(express) 생성 및 구동 
// 1. express 객체 생성 
const express = require('express');
const app = express();

let jsonData;
let data = {};
let songJsonData;
let songData = {};
let redteamInfo = [];
let blueteamInfo = [];
let redScore = 0;
let blueScore = 0;
let redAcc = 0;
let blueAcc = 0;

app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.static(__dirname + '/public'));
// 2. "/" 경로 라우팅 처리 
app.get("/", (req, res) => {
    res.render('index'); // index.html 파일 응답 
});


// 3. 30001 port에서 서버 구동 
const HTTPServer = app.listen(30001, () => {
    console.log("Server is open at port:30001");
});



// 그루미님 서버용
// let server = https.createServer((req, res) => {
//     res.writeHead(200);
//     //res.end(index);
// });

// let HTTPSServer = https.createServer((req, res) => {
//     res.writeHead(200);
//     //res.end(index);
// });


//server.addListener('upgrade', (req, res, head) => console.log('UPGRADE:', req.url));
// server.on('error', (err) => console.error(err));
//app.listen(3000, () => console.log('Http running on port 3000'));

/*const HTTPSServer = https.createServer(options, app).listen(30001, () => { console.log("Server is open at port:30001"); });
 */

// 2. WebSocket 서버 생성 / 구동
const wss = new ws.Server({
    server: HTTPServer, // WebSocket서버에 연결할 HTTP서버를 지정한다.
});



// const wss = new ws.Server({ server });

wss.on('connection', (ws, request) => {
    // 1) 연결 클라이언트 IP 취득 
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log(`새로운 클라이언트[${ip}] 접속`);
    //console.log(request.headers);

    // 2) 클라이언트에게 메시지 전송
    if (ws.readyState === ws.OPEN) {
        // 연결 여부 체크
        ws.send(JSON.stringify(`클라이언트[${ip}] 접속을 환영합니다 from 서버`));

        // 데이터 전송 } // 3) 클라이언트로부터 메시지 수신 이벤트 처리 
        ws.on('message', (msg) => {
            //console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);
            let jsonString = (JSON.parse(msg));
            console.log(jsonString);

            if (jsonString.team === "redteam") {
                if (redteamInfo.findIndex(redteamInfo => redteamInfo.name === jsonString.name) != -1) {
                    redteamInfo = Object.assign(redteamInfo, jsonString);
                } else {
                    redteamInfo.push(jsonString);
                }
                redAcc = 0;
                redteamInfo.forEach(i => {
                    redScore = Number(redScore) + Number(i.score);
                    redAcc = (Number(redAcc) + Number(i.percentage)) / redteamInfo.length;
                });
                data = {
                    "redScore": redScore,
                    "redAcc": redAcc,
                    "blueScore": blueScore,
                    "blueAcc": blueAcc
                };
                jsonData = JSON.stringify(data);
                ws.send(jsonData);
            } else if (jsonString.team === "blueteam") {
                if (blueteamInfo.findIndex(blueteamInfo => blueteamInfo.name === jsonString.name) != -1) {
                    blueteamInfo = Object.assign(blueteamInfo, jsonString);
                } else {
                    blueteamInfo.push(jsonString);
                }
                blueAcc = 0;
                blueteamInfo.forEach(i => {
                    blueScore = Number(blueScore) + Number(i.score);
                    blueAcc = (Number(blueAcc) + Number(i.percentage)) / blueteamInfo.length;
                });
                data = {
                    "redScore": redScore,
                    "redAcc": redAcc,
                    "blueScore": blueScore,
                    "blueAcc": blueAcc
                };
                jsonData = JSON.stringify(data);
                ws.send(jsonData);
            } else if (jsonString.songInfo === true) {
                songData = {
                    "songInfo": true,
                    "difficulty": jsonString.difficulty,
                    "image": jsonString.songCover,
                    "songName": jsonString.songName,
                    "songSubName": jsonString.songSubName,
                    "songAuthorName": jsonString.songAuthorName,
                    "levelAuthorName": jsonString.levelAuthorName,
                    "songBPM": jsonString.songBPM,
                    "noteJumpSpeed": jsonString.noteJumpSpeed
                }
                songJsonData = JSON.stringify(songData);
                ws.send(songJsonData);
            }

        });

        // 4) 에러 처러 
        ws.on('error', (error) => {
            console.log(`클라이언트[${ip}] 연결 에러발생 : ${error}`);
        });

        // 5) 연결 종료 이벤트 처리
        ws.on('close', () => {
            console.log(`클라이언트[${ip}] 웹소켓 연결 종료`);
        });
    }

});