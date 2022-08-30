const http = require("http");
var url = require('url');
const PORT = process.env.PORT || 5000;
let currentTurn = 0
let maxTurns = 1000
let board = [
    { owner: null, name: "Casa", value: 30, rent: 10 },
    { owner: null, name: "Predio", value: 450, rent: 15 },
    { owner: null, name: "Loja", value: 50, rent: 30 },
    { owner: null, name: "Apartamento", value: 20, rent: 10 },
    { owner: null, name: "Shopping", value: 100, rent: 70 },
    { owner: null, name: "Casa 2", value: 30, rent: 10 },
    { owner: null, name: "Predio 2", value: 450, rent: 15 },
    { owner: null, name: "Loja 2", value: 50, rent: 30 },
    { owner: null, name: "Apartamento 3", value: 20, rent: 10 },
    { owner: null, name: "Shopping 3", value: 100, rent: 70 },
    { owner: null, name: "Casa 3", value: 30, rent: 10 },
    { owner: null, name: "Predio 3", value: 450, rent: 15 },
    { owner: null, name: "Loja 3", value: 50, rent: 30 },
    { owner: null, name: "Apartamento 3", value: 20, rent: 10 },
    { owner: null, name: "Shopping 3", value: 100, rent: 70 },
    { owner: null, name: "Casa 4", value: 30, rent: 10 },
    { owner: null, name: "Predio 4", value: 450, rent: 15 },
    { owner: null, name: "Loja 4", value: 50, rent: 30 },
    { owner: null, name: "Apartamento 4", value: 20, rent: 10 },
    { owner: null, name: "Shopping 4", value: 100, rent: 70 },
]
const players = [
    { name: "impulsivo", type: "impulsivo", balance: 1000, movement: 0, isOut: false },
    { name: "exigente", type: "exigente", balance: 1000, movement: 0, isOut: false },
    { name: "cauteloso", type: "cauteloso", balance: 1000, movement: 0, isOut: false },
    { name: "aleatorio", type: "aleatorio", balance: 1000, movement: 0, isOut: false }
]
let reportIndex = 0
const ReportList = []
let report = []
function act(player, location) {
    if (player.name == location.owner) return
    switch (player.type) {
        case "impulsivo":
            if (!location.owner) {
                setOwner(player, location)
            } else {
                sendRent(player, location)
            }
            break
        case "exigente":
            if (!location.owner && location.rent > 50) {
                setOwner(player, location)
            } else {
                sendRent(player, location)
            }
            break
        case "cauteloso":
            if (!location.owner && (player.balance - location.value) > 80) {
                setOwner(player, location)
            } else {
                sendRent(player, location)
            }
            break
        case "aleatorio":
            let num = Math.random();
            if (!location.owner && num < 0.5) {
                setOwner(player, location)
            } else {
                sendRent(player, location)
            }
            break
    }
    if (player.balance < 0) {
        player.isOut = true
    }
    return
}
function logAction(message, console = false) {
    let reportMessage = {
        action: message,
        turn: currentTurn,
        timestamp: new Date()
    }
    if (console) logAction(reportMessage);
    report.push(reportMessage)
}
function sendRent(origin, location) {
    for (let player of players) {
        if (player.name == location.owner) {
            origin.balance -= location.rent
            player.balance += location.rent
            logAction(`${player.name} Alugou : ${location.name} de ${location.owner}`)
            return true
        }
    }
    return false
}
function setOwner(player, location) {
    for (let property of board) {
        if (property.name == location.name) {
            property.owner = player.name
            player.balance -= property.value
            logAction(`${player.name} Comprou : ${location.name}`)
            return true
        }
    }
    return false
}
function revokeProperties(player) {
    for (let property of board) {
        if (property.owner == player.name) {
            property.owner = null
            logAction(`${player.name} perdeu todas propriedades`)
        }
    }
}
function playTurn() {
    currentTurn++
    for (let player of players) {
        if (player.isOut) continue
        const movement = Math.floor(Math.random() * 6) + 1;
        if (((player.movement % board.length) + movement) >= board.length) { // verificaçao se o movimento completa uma volta ou completa uma volta
            logAction(`${player.name} deu uma volta e ganha 100`)
            player.balance += 100
        }
        player.movement += movement
        act(player, board[player.movement % board.length])
        if (player.isOut) revokeProperties(player)
        if (checkWinner()) return true
    }
    return false
}
let isFinished = false
function topPlayer() { //verifica o jogador com maior saldo em ordem de turno
    let topPlayer = null
    for (const player of players) {
        if (!topPlayer) topPlayer = player
        if (player.balance > topPlayer.balance) topPlayer = player
    }
    return topPlayer
}
function checkWinner() { // valida a existencia de um vencedor
    if (currentTurn >= maxTurns) {
        logAction({
            vencedor: topPlayer().name,
            jogadores: players.map((item) => { return item.name })
        })
        return true
    }
    let playingCount = players.filter((player) => player.isOut == false)
    if (playingCount.length == 1) {
        logAction({
            vencedor: playingCount[0].name,
            jogadores: players.map((item) => { return item.name })
        })
        return true
    } else {
        return false
    }
}
function playMatch() {
    do {
        isFinished = playTurn()

    } while (!isFinished)
    const currentReport = { report: report, id: reportIndex }
    ReportList.push(currentReport)
    reportIndex++
    report = []
    currentTurn = 0
    return currentReport.report[currentReport.report.length - 1].action
}

const server = http.createServer(async (req, res) => {
    let urlParse = url.parse(req.url, true);
    if (urlParse.pathname === "/jogo/simular" && req.method === "GET") {
        res.writeHead(200, { "Content-Type": "application/json" });
        if (urlParse.query.id) {
            let retrieved = { message: "Not Found" }
            if (!ReportList.length == 0) {
                ReportList.map((item) => {
                    if (item.id == Number(urlParse.query.id)) {
                        retrieved = item
                    }
                })
            }
            res.write(JSON.stringify(retrieved))
            res.end();
        } else {
            const result = playMatch()
            res.write(JSON.stringify(result));
        }

    }
    else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Route not found" }));
    }
});
server.listen(PORT, () => {
    console.log(`server started on port: ${PORT}`);
});
