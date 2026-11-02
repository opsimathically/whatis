// worker.js
const { parentPort } = require('worker_threads');

parentPort.on('message', (msg) => {
  parentPort.postMessage(`Received: ${msg}`);
});
