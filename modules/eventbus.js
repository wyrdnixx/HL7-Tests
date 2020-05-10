import EventEmitter from 'events';
import isPlainObject from 'lodash/isPlainObject.js';
import isString from 'lodash/isString.js';
import HL7 from 'hl7-standard';
import hl7processor from './hl7processor.js';
import { timingSafeEqual } from 'crypto';
import Server from './server.js';

class EventBus extends EventEmitter {
    
    

    constructor() {
        super();

        this.on('ACK', (clientId, message) => {            
            let ackmsg = hl7processor.createAck(message);            
            this.emit('sendData', clientId, ackmsg.build());                
        });

        this.on('ACK-ERR', (clientId, message, errcode, errmessage) => {    
            
            //console.log('ACK-ERR: ', errmessage)
            let ackmsg = hl7processor.createAckErr(message,errcode, errmessage);            
            this.emit('sendData', clientId, ackmsg.build());                
        });

    }


    getMessage(clientId,message) {
        try {
            
        //const fields = message.toString().split('|');

        //console.log('Message Fields: ', fields.length)

        var VT = String.fromCharCode(0x0b);
        var FS = String.fromCharCode(0x1c);
        var CR = String.fromCharCode(0x0d);


        var msg = message.toString();
            // remove first ascii char, if ist VT - vertical Tab
            if (msg[0].charCodeAt()  == 11 ) {
                msg = msg.substring(1);
            }
        
        let hl7 = new HL7(msg)
        

        hl7.transform(err => {

            if (err) {
                console.log('transorfmer errer: ', err.message);
                this.emi('ACL-ERR', clientId, message, '207', err.message)                
            } else {
                let familyName = hl7.get('PID.5.1');
                //console.log('checkHL7 got familyName: ', familyName);
                
                hl7processor.processMessage(hl7, clientId);
                //console.log(typeof(hl7processor.processMessage));

            }        
          });   

            

        } catch (error) {
            this.emit(
                'error',
                error,
            );
        }
    }













    /////////////////////////////////////////
    // Org von Marco
    consumeMessage(clientId, message) {
        try {
            let event;

            try {
                event = JSON.parse(message);
                console.log("Consume got: ", event)
            } catch (error) {
                throw new Error('Message is not valid JSON');
            }

            if (!isPlainObject(event)) {
                throw new Error('Message is not an object');
            }

            if (!isString(event.type)) {
                throw new Error('Message does not include a type');
            }

            if (!isPlainObject(event.data)) {
                throw new Error('Message does not include data');
            }

            this.emit(
                event.type,
                clientId,
                event.data,
            );
        } catch (error) {
            this.emit(
                'error',
                error,
            );
        }
    }

    produceMessage(clientId, event) {
        try {
            let message;

            console.log("Produce: ", event)
            if (!isPlainObject(event)) {
                throw new Error('Event is not an object');
            }

            if (!isString(event.type)) {
                throw new Error('Event does not include a type');
            }

            if (!isPlainObject(event.data)) {
                throw new Error('Event does not include data');
            }

            try {
                message = JSON.stringify(event);
            } catch (error) {
                throw new Error('Event is not valid JSON');
            }


            this.emit(
                'message',
                clientId,
                message,
            );
        } catch (error) {
            this.emit(
                'error',
                error,
            );
        }
    }
}

export default new EventBus();
