import eventBus from './eventbus.js';
import GamesController from '../controllers/gamescontroller.js';

class Interface {
    gamesController = new GamesController();

    constructor() {
        eventBus.on('createGame', (data) => {
            this.gamesController.createGame();
        });
        
        eventBus.on('gameCreateRequested', (data) => {
            //this.gamesController.createGame();
            console.log("interface gameCreateRequested");

            var obj = this.gamesController.createGame();
            console.log(obj)
            
        });
        
  
    }
}

export default Interface;
