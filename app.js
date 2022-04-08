// ********* app.js 파일 
const wsModule = require('ws');

// HTTP 서버(express) 생성 및 구동 
// 1. express 객체 생성 
const express = require('express');
const app = express();
app.use(express.json());
// 2. "/" 경로 라우팅 처리 
app.use("/", (req, res) => {
    res.sendFile(__dirname + '/index.html'); // index.html 파일 응답 
});


// 3. 30001 port에서 서버 구동 
const HTTPServer = app.listen(30001, () => {
    console.log("Server is open at port:30001");
});

// 2. WebSocket 서버 생성/구동 
const webSocketServer = new wsModule.Server({
    server: HTTPServer, // WebSocket서버에 연결할 HTTP서버를 지정한다.
});
let redScore = 0;
let bluescore = 0;

webSocketServer.on('connection', (ws, request) => {
    // 1) 연결 클라이언트 IP 취득 
    const ip = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
    console.log(`새로운 클라이언트[${ip}] 접속`);
    //console.log(request.headers);

    // 2) 클라이언트에게 메시지 전송
    if (ws.readyState === ws.OPEN) {
        // 연결 여부 체크
        ws.send(JSON.stringify("클라이언트[${ip}] 접속을 환영합니다 from 서버"));

        // 데이터 전송 } // 3) 클라이언트로부터 메시지 수신 이벤트 처리 
        ws.on('message', (msg) => {
            console.msg(msg)
            //console.log(`클라이언트[${ip}]에게 수신한 메시지 : ${msg}`);
            let jsonString = (JSON.parse(msg));
            console.log(jsonString.team);
            console.log(jsonString.name);
            if (jsonString.team === "redteam") {
                bluescore = Number(bluescore) + Number(jsonString.count);
                console.log(bluescore);
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
