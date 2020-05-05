import net from 'net';
import EventEmitter from 'events';
import uuid from 'uuid';
import fs from 'fs';
import HL7 from 'hl7-standard';

import eventbus from './eventbus.js';


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
      /*   
        this.on(
            'testevent',
            () => {
                console.log('Srv Testevent');
            }); */
            this.on(
                'hl7msg',  
              (clientId,hl7,) => {
                console.log('write message to file.')
                
                // MSH.6 =  Message Date
                //fs.writeFile('./hl7/' + hl7.get('MSH.7') + '.hl7',hl7.build(), (err) => {
                  fs.appendFile('./hl7/hl7log.log', '\n\n' + 'Got HL7:' + '\n' + hl7.build(), (err) => {
                  if (err) {
                    console.log('fs write file error: ', err.message);
                    throw err;
                  } else {
                      console.log('The file has been saved!');
                    }    
                });
                
                this.emit('ACK',clientId, hl7);
              
              
              });
              
              this.on(
                'ACK',
                (clientId, hl7) => {
                  
                  console.log('building ACK')
                  let ack = new HL7();
                  
                  ack.createSegment('MSH');
                  ack.set('MSH', {
                    'MSH.2': '^~\\&',
                    'MSH.3': hl7.get('MSH.5'), //MSH-3 Sendende Anwendung
                    'MSH.4': hl7.get('MSH.4'),
                    'MSH.5':  hl7.get('MSH.3'), // MSH-5 Empfangende Anwendung
                    'MSH.6': '',
                    'MSH.7': hl7.get('MSH.7'), //Message ID
                    'MSH.8': '',
                    'MSH.9': {
                        'MSH.9.1': 'ACK',
                        'MSH.9.2': hl7.get('MSH.9.2')
                    },
                    'MSH.10': hl7.get('MSH.10'),
                    'MSH.11': hl7.get('MSH.11'),
                    'MSH.12': hl7.get('MSH.12')
                  });
                  ack.createSegment('MSA');
                  ack.set('MSA', {
                    'MSA.1': 'CA',
                    'MSA.2': hl7.get('MSH.10')
                  });
                   ack.createSegment('ERR');
                   ack.set('ERR', {
                     'ERR.2': 'myapp',
                     'ERR.3': '207', // Errorcode - 207 = Application internal error	
                     'ERR.4': 'E', // Error severity -> Error, Information, Warning
                     'ERR.7': 'Trump denied it ' //Error-Text
                   });
               
              
                     // MSH.7 =  Message Date     
              
                 //fs.appendFile('./hl7/' + hl7.get('MSH.7') + '.hl7', '\n\n' + 'Sending ACK:' + '\n' + ack.build(), (err) => {
                  fs.appendFile('./hl7/hl7log.log', '\n\n' + 'Sending ACK:' + '\n' + ack.build(), (err) => {
                  if (err) {
                    console.log('fs write file error: ', err.message);
                    throw err;
                  } else {
                      console.log('The file has been saved!');
                    }    
                });
               
                    console.log(ack.getSegment('MSH'));
                  this.sendData(clientId, ack.build());
                  
                }
              )
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
        
    /* this.emit('testevent') */

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
