import eventBus from './eventbus.js';
import fs from 'fs';
import HL7 from 'hl7-standard';
import pattask from './pattask.js';


class hl7processor {

    /**hl7processor constructor
     */
    constructor() {
    }

    processMessage (hl7,clientId) {
        //console.log('hl7processor got message: ', hl7)

        //console.log('write message to file.')
                
        // MSH.6 =  Message Date
        //fs.writeFile('./hl7/' + hl7.get('MSH.7') + '.hl7',hl7.build(), (err) => {
          fs.appendFile('./hl7/hl7log.log', '\n\n' + 'Got HL7:' + '\n' + hl7.build(), (err) => {
          if (err) {
            console.log('fs write file error: ', err.message);
            throw err;
          } else {
              //console.log('The file has been saved!');
            }    
        });
        
        //console.log(hl7.get('MSH.9.2'))

        switch (hl7.get('MSH.9.2')) {
          // Patient admit  
          case 'A01':
            console.log("A01 Nachricht")
                pattask.hl7ADT_A01(hl7,clientId)
                break;
          // patient transfer
          case 'A02':
            //console.log("A02 Nachricht")
                pattask.hl7ADT_Update(hl7,clientId)
                break;
          // patient discharge
          case 'A03':
                pattask.hl7ADT_A03(hl7,clientId)
                //eventBus.emit('ACK-ERR', clientId, hl7, 200,'A03 not jet implemented' )
                break;
          // patient registration
          case 'A04':
          //      pattask.hl7ADT_A01(hl7,clientId)
          eventBus.emit('ACK-ERR', clientId, hl7, 200,'A04 not jet implemented' )
                break;
          // patient information update
          case 'A08':
            pattask.hl7ADT_Update(hl7,clientId)
            //eventBus.emit('ACK-ERR', clientId, hl7, 200,'A08 not jet implemented' )
                break;
          default:
                eventBus.emit('ACK-ERR', clientId, hl7, 200,'Message type not supported by application.' )
                break;
        }
    }




    createAck (hl7) {

        //console.log('building ACK')
        //let ack = new HL7();
        
        let ack = this.createMSH(hl7, new HL7());   

        ack.createSegment('MSA');
        ack.set('MSA', {
          'MSA.1': 'CA',
          'MSA.2': hl7.get('MSH.10')
        });
        // ERR nicht mehr im ACK -> jetzt in createAckErr
       /*   ack.createSegment('ERR');
         ack.set('ERR', {
           'ERR.2': 'myapp',
           'ERR.3': '207', // Errorcode - 207 = Application internal error	
           'ERR.4': 'E', // Error severity -> Error, Information, Warning
           'ERR.7': 'Trump denied it ' //Error-Text
         }); */

         // Ack sollte noch in die File geschrieben werden.
         fs.appendFile('./hl7/hl7log.log', '\n\n' + 'ACK build:' + '\n' + ack.build(), (err) => {
             if (err) console.log('File write error');
         });
         return ack;
    }


    createAckErr (hl7, errcode,errmessage) {

        //errcode = 207 // Errorcode - 207 = Application internal error	



        let ack = this.createMSH(hl7, new HL7());        
        
        ack.createSegment('MSA');
        ack.set('MSA', {
          'MSA.1': 'AE',
          'MSA.2': hl7.get('MSH.10')
        });
         ack.createSegment('ERR');
         ack.set('ERR', {
           'ERR.1': 'hl7TestApp',
           'ERR.2': errcode, 
           'ERR.3': 'E', // Error severity -> Error, Information, Warning
           'ERR.4': errmessage //Error-Text
         });

         // Ack sollte noch in die File geschrieben werden.
         fs.appendFile('./hl7/hl7log.log', '\n\n' + 'ACK-ERR build:' + '\n' + ack.build(), (err) => {
             if (err) console.log('File write error');
         });
         return ack;
    }

    createMSH(hl7, ack) {

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
               'MSH.9.2': hl7.get('MSH.9.2'),
              /*'MSH.9.3': 'ACK', */
          },
          'MSH.10': hl7.get('MSH.10'),
          'MSH.11': hl7.get('MSH.11'),
          'MSH.12': hl7.get('MSH.12')
        });

        return ack

    }
}

export default new hl7processor();