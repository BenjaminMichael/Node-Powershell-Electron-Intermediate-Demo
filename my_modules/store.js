// my store is a single file basic Redux store.  it:
//
// 1) tracks state so we can export a Report
// 2) tracks the undoHistory in the form of a List, and the undo button "unRemoves" the state as well as pops it off this undoHistory List that acts as a LIFO stack so Undo always targets the most recently removed group.
//
// what it DOESN'T do is update UI state when it changes.  when CREATE is called it
// returns the list of groups to remove.

const {List} = require('immutable');
const Redux = require('redux');

const historyReducer = (state={}, actions) => {
switch(actions.type) {
    case 'UPDATE':
    //this needs to set fullControl to True or False
    const newADGroupsToRemove = state.adGroupsToRemove.update(actions.bind_i, val => {
        const updatedListEntry = {
            dn: val.dn,
            removed: val.removed,
            fullControl: actions.fullControl
        };
        return updatedListEntry;
    });
    return {
        adGroupsToRemove: newADGroupsToRemove,
        undoHistory: state.undoHistory,
        currentUser: state.CurrentUser
    };
    break;
    case 'REMEMBER':
    const newUndoHistory = state.undoHistory.push({dn: state.adGroupsToRemove.get(actions.bind_i), undo_i: actions.bind_i});
    //this needs to set Removed to True
    const newADGroupList = state.adGroupsToRemove.update(actions.bind_i, () => state.adGroupsToRemove.get(actions.bind_i).dn);
        return {
            adGroupsToRemove: state.adGroupsToRemove,
            undoHistory: newUndoHistory,
            currentUser: state.currentUser
        };
    break;
    case 'UNDO':
    const {undo_i, dn} = state.undoHistory.first();
    const postUndoHistory = state.undoHistory.shift();
    //const postUndoADGroupList = state.adGroupsToRemove.update(undo_i, () => dn);
    return {
        adGroupsToRemove: state.adGroupsToRemove,
        undoHistory: postUndoHistory,
        currentUser: state.currentUser
    };
    break;
    default: return state;
}
};
module.exports.CREATE = (adGroupDNsToRem, user1Name, currentUser) => {
    function rememberADGroup(bind_i){
        return {
            type: 'REMEMBER',
            bind_i: bind_i
        };
    }
    function undoLastADGroup(){
        return {
            type: 'UNDO'
        };
    }
    function updateADGroup(bind_i, fullControl){
        return {
            type: 'UPDATE',
            bind_i: bind_i,
            fullControl: fullControl
        };
    }
    data = JSON.parse(adGroupDNsToRem);
    const initialGroupsToRemove = List(data.user1sGroups);
    const initialState = {
        adGroupsToRemove: initialGroupsToRemove,
        undoHistory: List(),
        currentUser,
        user1Name
    };
    const store = Redux.createStore(historyReducer, initialState);
    module.exports.REMEMBER = (i) => {store.dispatch(rememberADGroup(i));};
    
    module.exports.UNDO = () => {
        const myUndoState = store.getState();
        const myFirstInQueue = myUndoState.undoHistory.first();
        store.dispatch(undoLastADGroup());
        return {type: 'readd', groupDN: myFirstInQueue.dn, i: myFirstInQueue.undo_i};
    };
    
    module.exports.UPDATE = (bind_i, fullControl) => {store.dispatch(updateADGroup(bind_i, fullControl));};

    store.subscribe( () => {
        const myCurrentState = store.getState();
        const myElement = $('#remove_reporting_body');
        myElement.empty();
        let myFullControlGroups, myCantEditGroups, myUnknownGroups = "";
        const listOfFullControlGroups = myCurrentState.adGroupsToRemove.filter(function(obj){return obj.fullControl == true;});
        listOfFullControlGroups.forEach((obj) => {
            myFullControlGroups += `<li>${(JSON.stringify(obj.dn)).split(",")[0].slice(3)}</li>`;
        });
        
            //if(x.fullControl == false){
            //    myCantEditGroups += `<li>${JSON.stringify(x)}</li>`;
            
        const myHTML = `<div>
        <div class="row">
            <h4>Groups I am able to edit:</h4><br>
            <ul>${myFullControlGroups}</ul>
        </div>

        <div class="row">
            <h4>Groups I am not able to edit:</h4><br>
            <ul>${myCantEditGroups}</ul>
        </div>

        </div>`;
        myElement.append(myHTML);

        if (myCurrentState.undoHistory.count()>0){
            $('#undoRemBtn').removeClass('disabled');
        }else{
            $('#undoRemBtn').addClass('disabled');
        }
    });
    const myString =`${adGroupDNsToRem}, ${user1Name}, ${currentUser}`;
    return data.user1sGroups;
};