

const net = require('net');
const port = 8080;
const host = '0.0.0.0';
const fs = require('fs');



const server = net.createServer();


server.listen(port, host, () => {
   console.log('TCP Server is running on port ' + port + '.');
});



let sockets = [];

server.on('connection', function(sock) {
   console.log('CONNECTED: ' + sock.remoteAddress + ':' + sock.remotePort);
    
   sock.setEncoding('base64');
    // Hack that must be added to make this work as expected
     

   sockets.push(sock);

   sock.on('data', function(data) {
     
    let buff = Buffer.from(data, 'base64');  
    let text = buff.toString('utf-8');

    var decoded = new Buffer(buff, 'base64').toString('ascii')

    let oneline = decoded.replace(/\r/g, "");   

       console.log('string: ', oneline)
    
       /* // Write the data back to all the connected, the client will receive it as data from the server
       sockets.forEach(function(sock, index, array) {
           sock.write(sock.remoteAddress + ':' + sock.remotePort + " said " + data + '\n');
       }); */


   });

   // Add a 'close' event handler to this instance of socket
   sock.on('close', function(data) {
       let index = sockets.findIndex(function(o) {
           return o.remoteAddress === sock.remoteAddress && o.remotePort === sock.remotePort;
       })
       if (index !== -1) sockets.splice(index, 1);
       console.log('CLOSED: ' + sock.remoteAddress + ' ' + sock.remotePort);
   });

   sock.on('error', function(er) {
     console.log('Error on Connection', er);
   })
});
