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
    case 'REMEMBER':
    const newUndoHistory = state.undoHistory.push({dn: state.adGroupsToRemove.get(actions.bind_i), undo_i: actions.bind_i});
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
        return {groupDN: myFirstInQueue.dn, i: myFirstInQueue.undo_i};
    };
    
    store.subscribe( () => {
        const myCurrentState = store.getState(); //put this in the modal AUTO-REPORT
        if (myCurrentState.undoHistory.count()>0){
            $('#undoRemBtn').removeClass('disabled');
        }else{
            $('#undoRemBtn').addClass('disabled');
        }
    });
        
    return data.user1sGroups;
};