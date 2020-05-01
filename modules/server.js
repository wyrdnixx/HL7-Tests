import net from 'net';
import EventEmitter from 'events';
import uuid from 'uuid';
//import fs from 'fs';
import HL7 from 'hl7-standard';

import eventbus from './eventbus.js';


class Server extends EventEmitter {
    clients = {};

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
    }

    handleConnection(_socket) {
        const clientId = uuid.v4();
        this.clients[clientId] = _socket;

        console.log('Client connected: ', clientId , ' : ', _socket.remoteAddress, ":",  _socket.remotePort)
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
        
        // lösche windows Zeilenumbruch - nur für Consolen-Log benötigt.
        //let msg = _data.toString().replace(/\r/g, "");
        //console.log('cleaned data: ',  msg);   
        const fields = data.toString().split('|');

        console.log('Message Fields: ', fields.length)
        var msg = data.toString();
            // remove first ascii char, if ist VT - vertical Tab
            if (msg[0].charCodeAt()  == 11 ) {
                msg = msg.substring(1);
            }
        
        let hl7 = new HL7(msg)
        
        hl7.transform(err => {

            if (err) {
                console.log('transorfmer errer: ', err.message);                
            } else {
                let familyName = hl7.get('PID.5.1');
                console.log('checkHL7 got familyName: ', familyName);
                this.emit('hl7msg', clientId, hl7);
            }        
          });          
/* 

        if (!msg) {
            console.log('Error parsing Message to HL7');
        } else {
            this.emit('hl7msg', clientId, data);
        } */
        
        
    }

    sendData(clientId,data) {
        
        //console.log(clientId)
        console.log('Sending back: ', data.toString());
        var VT = String.fromCharCode(0x0b);
        var FS = String.fromCharCode(0x1c);
        var CR = String.fromCharCode(0x0d);


        this.clients[clientId].write(VT + data.toString() + FS + CR);
        //(VT + (this.ack).toString() + FS + CR);
    }

checkHl7(data) {

    console.log(data.toString().replace(/\r/g, "\r\n"));
  
    let msg = data.toString(); //Convert to String (Maybe Binary)
  
    // remove first ascii char, if ist VT - vertical Tab
    if (msg[0].charCodeAt()  == 11 ) {
      msg = msg.substring(1);
    }
  
    let hl7 = new HL7(msg)
  
    console.log('first char: ', msg.toString()[0] , " -> ", msg.toString()[0].charCodeAt())
   
        hl7.transform(err => {

            if (err) {
                console.log('transorfmer errer: ', err.message);
                return err.message;         
            } else {
                let familyName = hl7.get('PID.5.1');
                console.log('checkHL7 got familyName: ', familyName);
                return hl7;
            }        
          });          
   
    
  
/*     if (hl7.get('PID.4') == '200018075') {
      server.emit('ACK',clientId);
    } else {
  
    }
 */  
}
    

}

export default Server;
