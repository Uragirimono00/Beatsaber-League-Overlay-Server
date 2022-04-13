document.addEventListener("DOMContentLoaded", () => {

    const urlParams = new URLSearchParams(window.location.search);

    function ScoreChanged() {
        let redAcc = document.getElementsByClassName('redAcc')[0];
        let blueAcc = document.getElementsByClassName('blueAcc')[0];
        if (redAcc.innerHTML > blueAcc.innerHTML) {
            redAcc.style.fontSize = "2em";
            redAcc.style.opacity = "1";
            blueAcc.style.fontSize = "1.5em";
            blueAcc.style.opacity = ".8";
        } else if (redAcc.innerHTML < blueAcc.innerHTML) {
            redAcc.style.opacity = ".8";
            redAcc.style.fontSize = "1.5em";
            blueAcc.style.fontSize = "2em";
            blueAcc.style.opacity = "1";
        }
    }
    var ip = "localhost";
    var port = 30001;

    var socket = new WebSocket(`wss://${ip}:${port}`);

    socket.addEventListener("open", () => {
        console.log("WebSocket opened");
    });

    socket.onmessage = function(event) {
        console.log(`서버 웹소켓에게 받은 데이터: ${event.data}`);
        const obj = JSON.parse(event.data);
        document.getElementsByClassName("redAcc")[0].innerHTML = obj.redAcc;
        document.getElementsByClassName("redScore")[0].innerHTML = obj.redScore;
        document.getElementsByClassName("blueAcc")[0].innerHTML = obj.blueAcc;
        document.getElementsByClassName("blueScore")[0].innerHTML = obj.blueScore;
        ScoreChanged();
        if (obj.songName) {
            document.getElementById("Title").innerHTML = obj.songSubname != null ? `${obj.songName} - ${obj.songSubname}` : `${obj.songName}`;
            document.getElementById("Author").innerHTML = obj.songAuthorName != null ? `${obj.songAuthorName} - ${obj.levelAuthorName}` : `${obj.levelAuthorName}`;
            document.getElementById("Bpm").innerHTML = `BPM : ${obj.songBPM}`;
            document.getElementById("Njs").innerHTML = `NJS : ${obj.noteJumpSpeed}`;
            var cover = document.getElementById("image");
            cover.setAttribute("src", `data:image/png;base64,${data.songCover}`);
        }
    }

    const setScore = urlParams.get('setscore');
    const redWin = urlParams.get('redwin');
    const blueWin = urlParams.get('bluewin');
    const blueteamName = urlParams.get('blueteamname');
    const redteamName = urlParams.get('redteamname');
    let scoreText = "";
    console.log(setScore);
    console.log(redWin);
    console.log(blueWin);
    for (let i = 0; i < setScore; i++) {
        if (i < redWin) {
            scoreText = scoreText.concat("■");
        } else {
            scoreText = scoreText.concat("□");
        }
    }
    document.getElementsByClassName("teamScore")[0].innerHTML = scoreText;
    scoreText = "";
    for (let i = setScore; i > 0; i--) {
        if (i <= blueWin) {
            scoreText = scoreText.concat("■");
        } else {
            scoreText = scoreText.concat("□");
        }
    }
    document.getElementsByClassName("redteamName")[0].innerHTML = blueteamName;
    document.getElementsByClassName("blueteamName")[0].innerHTML = redteamName;
});