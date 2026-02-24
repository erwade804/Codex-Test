const http = require("node:http");
const { PORT } = require("./config/env");
const { requestHandler } = require("./app");

const server = http.createServer((req, res) => {
  requestHandler(req, res).catch(() => {
    res.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "Internal server error" }));
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});

module.exports = server;
