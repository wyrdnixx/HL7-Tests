import net from 'net';
import EventEmitter from 'events';
import uuid from 'uuid';
//import HL7 from 'hl7-standard';
//import fs from 'fs';
import eventbus from './eventbus.js';
//import hl7processor from './hl7processor.js';
import db from './db.js';

class Server extends EventEmitter {
    clients = {};


/**
 * new Server instance
 * @param Server listening port
 * @param Server listening host adress
 */

    constructor(_port, _host) {
        super();


        

        this.server = net.createServer();

        this.server.listen(_port, _host, () => {
            console.log('TCP Server is running on port ' + _port + '.');
         });

        this.server.on(
            'listening',
            () => this.emit('SrvStarted'),
            console.log('Server is listening...'));
        this.server.on(
            'connection',
            (socket) => this.handleConnection(socket),
        ); 


        eventbus.on('sendData', (clientId, message) => {
            //console.log('ready to send message: ', message)

            this.sendData(clientId,message);
            
        })


 
    }



    handleConnection(_socket) {
        const clientId = uuid.v4();
        this.clients[clientId] = _socket;

        //console.log('Client connected: ', clientId , ' : ', _socket.remoteAddress, ":",  _socket.remotePort)
        _socket.on('data',
        (data) => this.receiveData(clientId, data))

        _socket.on('close',
        () =>{
            delete this.clients[clientId];
        });

        _socket.on('error',
        (clientId,error) =>{
            console.log('connection Error on Client: ', clientId , ' : ', error)
        });

    }

    receiveData(clientId, data) {
        console.log('Client: ', clientId);
        
    
        eventbus.getMessage(clientId, data);        
        
    }

    sendData(clientId,data) {
        
        //console.log(clientId)
        //console.log('Sending back: ', data.toString());
        var VT = String.fromCharCode(0x0b);
        var FS = String.fromCharCode(0x1c);
        var CR = String.fromCharCode(0x0d);

        this.clients[clientId].write(data.toString());
        //this.clients[clientId].write(VT + data.toString() + FS + CR);
        
    }

}

export default Server;
