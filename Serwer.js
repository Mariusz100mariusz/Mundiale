// ===== server.js ===== // Gra 1v1 online w przeglądarce – wymienianie uczestników MŚ 2014 // Wersja gotowa do wrzucenia na Render.com // Mobilna, bez logowania, bez limitu czasu

const express = require('express'); const http = require('http'); const { Server } = require('socket.io');

const app = express(); const server = http.createServer(app); const io = new Server(server);

// Render używa PORT z process.env const PORT = process.env.PORT || 3000;

const TEAMS_2014 = new Set([ 'Brazylia','Chorwacja','Meksyk','Kamerun', 'Hiszpania','Holandia','Chile','Australia', 'Kolumbia','Grecja','Wybrzeże Kości Słoniowej','Japonia', 'Urugwaj','Kostaryka','Anglia','Włochy', 'Szwajcaria','Ekwador','Francja','Honduras', 'Argentyna','Bośnia i Hercegowina','Iran','Nigeria', 'Niemcy','Portugalia','Ghana','USA', 'Belgia','Algieria','Rosja','Korea Południowa' ]);

let room = { players: [], turn: 0, usedTeams: new Set(), scores: [0, 0] };

app.get('/', (req, res) => { res.send(`<!doctype html>

<html lang="pl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MŚ 2014 – Gra 1v1</title>
  <style>
    body { font-family: sans-serif; background:#111; color:#fff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
    .box { background:#222; padding:20px; border-radius:15px; width:90%; max-width:400px; box-shadow:0 0 15px #000; }
    h2 { text-align:center; font-size:1.5em; }
    input, button { width:100%; padding:15px; margin-top:15px; font-size:1.2em; border-radius:8px; border:none; }
    button { cursor:pointer; background:#4CAF50; color:white; font-weight:bold; }
    #status, #turn, #score { text-align:center; margin-top:10px; font-size:1.1em; }
  </style>
</head>
<body>
  <div class="box">
    <h2>MŚ 2014 – gra 1v1</h2>
    <p id="status">Łączenie…</p>
    <p id="turn"></p>
    <p id="score"></p>
    <input id="team" placeholder="Podaj reprezentację" autocomplete="off" />
    <button onclick="send()">Zatwierdź</button>
  </div>
  <script src="/socket.io/socket.io.js"></script>
  <script>
    const socket = io();
    const status = document.getElementById('status');
    const turnEl = document.getElementById('turn');
    const scoreEl = document.getElementById('score');
    const input = document.getElementById('team');socket.on('status', msg => status.innerText = msg);
socket.on('state', state => {
  turnEl.innerText = state.turn;
  scoreEl.innerText = `Wynik: ${state.scores[0]} : ${state.scores[1]}`;
});

function send() {
  const value = input.value.trim();
  if(value) socket.emit('team', value);
  input.value = '';
  input.focus();
}

input.addEventListener('touchstart', () => input.focus());

  </script>
</body>
</html>`);
});io.on('connection', socket => { if(room.players.length >= 2) { socket.emit('status', 'Pokój pełny'); return; }

const playerIndex = room.players.length; room.players.push(socket); socket.emit('status', Jesteś graczem ${playerIndex+1}); io.emit('state', getState());

socket.on('team', team => { if(room.players[room.turn] !== socket) return;

if(TEAMS_2014.has(team) && !room.usedTeams.has(team)) {
  room.usedTeams.add(team);
  room.scores[room.turn]++;
  room.turn = room.turn === 0 ? 1 : 0;
  io.emit('status', `Poprawnie: ${team}`);
} else {
  io.emit('status', `Błąd lub powtórka: ${team}`);
  room.turn = room.turn === 0 ? 1 : 0;
}

io.emit('state', getState());

});

socket.on('disconnect', () => { room = { players: [], turn: 0, usedTeams: new Set(), scores: [0,0] }; }); });

function getState() { return { turn: Tura gracza ${room.turn+1}, scores: room.scores }; }

server.listen(PORT, () => console.log(Gra działa na porcie ${PORT}));
