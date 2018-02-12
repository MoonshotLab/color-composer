const io = require('socket.io-client');
export let socket = io();

export function init() {
  socket.emit('join', { uuid: window.kan.uuid });
}
