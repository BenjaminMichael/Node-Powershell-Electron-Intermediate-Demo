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
    const newUndoHistory = state.undoHistory.push(state.adGroupsToRemove.get(actions.bind_i));
    const newADGroupList = state.adGroupsToRemove.update(actions.bind_i, function(){return {dn: state.adGroupsToRemove.get(actions.bind_i).dn, removed:true};});
    return {
        adGroupsToRemove: newADGroupList,
        undoHistory: newUndoHistory,
        currentUser: state.currentUser
    };
    break;
    case 'UNDO':
    const {bind_i, dn} = state.undoHistory.first();
    const postUndoHistory = state.undoHistory.shift();
    const postUndoADGroupList = state.adGroupsToRemove.update(bind_i, () => dn);
    return {
        adGroupsToRemove: postUndoADGroupList,
        undoHistory: postUndoHistory,
        currentUser: state.currentUser
    };
    break;
    default: return state;
}
};
module.exports.CREATE = (adGroupDNsToRem, currentUser) => {
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
        currentUser
    };
    const store = Redux.createStore(historyReducer, initialState);
    module.exports.REMEMBER = (i) => {store.dispatch(rememberADGroup(i));};
    module.exports.REPORT = () => {
        const myReportState = store.getState();
        console.log('do this in a modal:');
        console.log(myReportState);
    };
    module.exports.UNDO = () => {
        const myUndoState = store.getState();
        const {undo_bind_i, undo_dn} = myUndoState.undoHistory.first();
        store.dispatch(undoLastADGroup());
        return {userDN: myUndoState.user1Name, groupDN: undo_dn, i: undo_bind_i};
    };
    /* useful for debugging
    store.subscribe( () => {
        const myState = store.getState();
        console.log(myState.undoHistory.count());
        });
        */
    return data.user1sGroups;
};