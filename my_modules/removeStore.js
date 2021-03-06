// my store is a single file basic Redux store.  it:
//
// 1) tracks state so we can export a Report
// 2) tracks the undoHistory in the form of a List, and the undo button "unRemoves" the state as well as pops it off this undoHistory List that acts as a LIFO stack so Undo always targets the most recently removed group.
//
// what it DOESN'T do is update UI state when it changes.  when CREATE is called it
// returns the list of groups to remove.  dom manipulations functions take it from there.
// note that CREATE isnt a dispatched action.  it creates the store.

const {List} = require('immutable');
const Redux = require('redux');

const removeReducer = (state={}, actions) => {
switch(actions.type) {
    case 'UPDATE':
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
        currentUser: state.CurrentUser,
        user1Name: state.user1Name
    };
    break;
    case 'REMEMBER':
    const newUndoHistory = state.undoHistory.push({dn: actions.dn, undo_i: actions.bind_i});
    const newADGroupList = state.adGroupsToRemove.update(actions.bind_i, val => {
        const updatedListEntry = {
            dn: val.dn,
            removed: true,
            fullControl: val.fullControl
        };
        return updatedListEntry;
    });
        return {
            adGroupsToRemove: newADGroupList,
            undoHistory: newUndoHistory,
            currentUser: state.currentUser,
            user1Name: state.user1Name
        };
    break;
    case 'SAVENAMES':

    break;
    case 'UNDO':
    const {undo_i, dn} = state.undoHistory.first();
    const postUndoHistory = state.undoHistory.shift();
    const postUndoADGroupList = state.adGroupsToRemove.update(undo_i, val => {
        const updatedListEntry = {
            dn: val.dn,
            removed: false,
            fullControl: val.fullControl
        };
        return updatedListEntry;
    });
    return {
        adGroupsToRemove: postUndoADGroupList,
        undoHistory: postUndoHistory,
        currentUser: state.currentUser,
        user1Name: state.user1Name
    };
    break;
    default: return state;
}
};
module.exports.CREATE = (adGroupDNsToRem, user1Name, currentUser) => {
    function rememberADGroup(bind_i, dn){
        return {
            type: 'REMEMBER',
            bind_i: bind_i,
            dn: dn
        };
    }
    function saveNames(user1Name, currentXXUser){
        return {
            type:'SAVENAMES',
            user1Name: user1Name,
            currentXXUser: currentXXUser
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
    
    const  user1GroupsPlusParameters = [];
    adGroupDNsToRem.forEach(x => {
        user1GroupsPlusParameters.push({removed: false, fullControl: "not yet known", dn: x});
    });
    const initialState = {
        adGroupsToRemove: List(user1GroupsPlusParameters),
        undoHistory: List(),
        currentUser: currentUser,
        user1Name: user1Name
    };
    const store = Redux.createStore(removeReducer, initialState);
    module.exports.GETANYMISSED = () => {
        console.log("debug1: Queue drained.");
        let getCurrentState = store.getState();
        for (let i=0;i<(getCurrentState.adGroupsToRemove.size);i++){
            if((getCurrentState.adGroupsToRemove.get(i)).fullControl === 'not yet known'){
                return {groupDN:(getCurrentState.adGroupsToRemove.get(i)).dn,i:i};
            }
        }
        return 'done';
    };
    module.exports.REMEMBER = (i, dn) => {store.dispatch(rememberADGroup(i, dn));};
    
    module.exports.UNDO = () => {
        const myUndoState = store.getState();
        const myFirstInQueue = myUndoState.undoHistory.first();
        store.dispatch(undoLastADGroup());
        
        return { workflow: "Remove", step: 'add-ADGroupMember', payload: {targetGroupName: myFirstInQueue.dn, targetUserDN: myUndoState.user1Name, i: myFirstInQueue.undo_i}};
    };
    
    module.exports.UPDATE = (bind_i, fullControl) => {store.dispatch(updateADGroup(bind_i, fullControl));};

store.subscribe(() => {
    const myCurrentState = store.getState();
        const myElement = $('#remove_reporting_body');
        myElement.empty();
        let removedGroups=[];
        let cantEditGroups=[];
        let myUnknownGroups = [];
        const LISTofRemovedGroups = myCurrentState.adGroupsToRemove.filter(function(obj){return obj.removed == true;});
        LISTofRemovedGroups.forEach((val) => {
            removedGroups += `${(val.dn).split(",")[0].slice(3)}<br>`;
        });
        const LISTofCantEditGroups = myCurrentState.adGroupsToRemove.filter(function(obj){return obj.fullControl == false;});
        LISTofCantEditGroups.forEach((val) => {
            cantEditGroups +=  `${(val.dn).split(",")[0].slice(3)}<br>`;
        });
        const myHTML = `I removed ${$('#remUserHeading').text()} from the following AD Groups:<br>${removedGroups}<br>I didn't have access to remove them from:<br>${cantEditGroups}`;
        myElement.append(myHTML);
        console.log(myCurrentState.undoHistory);
        if (myCurrentState.undoHistory.count()>0){
            $('#undoRemBtn').removeClass('disabled');
        }else{
            $('#undoRemBtn').addClass('disabled');
        }
});

    return adGroupDNsToRem;
};