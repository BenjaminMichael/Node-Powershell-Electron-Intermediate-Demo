const Redux = require("redux");


const historyReducer = (array=[], actions) => {

    switch(actions.type) {
        case 'REMEMBER': 
        let newArray = array.slice();
        newArray.splice(array, 0, actions);
        return newArray;
        break;
        case 'UNDO':
        let newArrayUndo = array.slice();
        newArrayUndo.splice(array, 1);
        return newArrayUndo;
        break;
        default: return array;
    }
};


const historyStore = Redux.createStore(historyReducer);


historyStore.subscribe( () => {
    const myStateArray = historyStore.getState();
    
});


function logADGroup(uDN, gDN){
    return {
        type: 'REMEMBER',
        userDN: uDN,
        groupDN: gDN,
    };
}

function undoLastADGroup(){
    return {
        type: 'UNDO'
    };
}


module.exports.REMEMBER = (userDN, groupDN) => {historyStore.dispatch(logADGroup(userDN, groupDN));};
module.exports.UNDO = () => {
    const myStateArray = historyStore.getState();
    myStateArray[0].undoCount = myStateArray.length;
    historyStore.dispatch(undoLastADGroup());
    return myStateArray[0];
};