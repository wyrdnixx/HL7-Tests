import EventEmitter from 'events';
import isPlainObject from 'lodash/isPlainObject.js';
import isString from 'lodash/isString.js';

class EventBus extends EventEmitter {
    constructor() {
        super();
    }

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
