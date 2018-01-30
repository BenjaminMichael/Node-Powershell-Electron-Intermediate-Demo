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


/* useful for debugging
historyStore.subscribe( () => {
    const myStateArray = historyStore.getState();
    console.log(myStateArray);
});
*/

function logADGroup(uDN, gDN, i){
    return {
        type: 'REMEMBER',
        userDN: uDN,
        groupDN: gDN,
        i: i
    };
}

function undoLastADGroup(){
    return {
        type: 'UNDO'
    };
}

//dispatch
module.exports.REMEMBER = (userDN, groupDN, i) => {historyStore.dispatch(logADGroup(userDN, groupDN, i));};

// dispatch
// UNDO() works L.I.F.O.
// it pops the last adGroup that was removed from the history store's state array, returning the value
module.exports.UNDO = () => {
    const myStateArray = historyStore.getState();
    if(myStateArray[0]){
        myStateArray[0].undoCount = myStateArray.length;
        historyStore.dispatch(undoLastADGroup());
        return myStateArray[0];
    }else{
        return;
    }
};