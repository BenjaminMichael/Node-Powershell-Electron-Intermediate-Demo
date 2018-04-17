const {List} = require('immutable');
const Redux = require('redux');

const compareReducer = (state={}, actions) => {
switch(actions.type) {
    case 'ADD':
    return {
        adGroupsToCompare: state.adGroupsToCompare,
        groupsAdded: state.groupsAdded.push({bind_i: actions.bind_i, dn: actions.group}),
        names: state.names
    };
    break;
    case 'UNDO':
    return {
        adGroupsToCompare: state.adGroupsToCompare,
        groupsAdded: state.groupsAdded.filterNot(function(item) { return item.bind_i === actions.bind_i; }),
        names: state.names
    };
    break;
    case 'UPDATE':
   return {
        adGroupsToCompare: state.adGroupsToCompare.update(actions.bind_i, val =>{
        const updatedListEntry = {
            dn: val.dn,
            removed: val.removed,
            fullControl: actions.fullControl
        };
        return updatedListEntry;
        }),
        groupsAdded: state.groupsAdded,
        names: state.names
    };
    break;
    default: return state;
}
};

module.exports.CREATE = (user1UniqGroups, names) => {
    function addUserToADGroup(data){
        return {
            type: 'ADD',
            group: data[0].groupDN,
            bind_i: data[0].bind_i
        };
    }
    function undoAddADGroup(bind_i){
        return {
            type: 'UNDO',
            bind_i: bind_i
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
    user1UniqGroups.forEach(x => {
        user1GroupsPlusParameters.push({removed: false, fullControl: "not yet known", dn: x});
    });
    const initialState = {
        adGroupsToCompare: List(user1GroupsPlusParameters),
        groupsAdded: List(),
        names: names
    };
    const compareStore = Redux.createStore(compareReducer, initialState);
    const myCurrentState = compareStore.getState();
    
    module.exports.ADD = (data) => {compareStore.dispatch(addUserToADGroup(data));};
    module.exports.GETANYMISSED = () => {
        let getCurrentState = compareStore.getState();
        for (let i=0;i<(getCurrentState.adGroupsToCompare.size);i++){
            if((getCurrentState.adGroupsToCompare.get(i)).fullControl === 'not yet known'){
                return {groupDN: (getCurrentState.adGroupsToCompare.get(i)).dn,i:i};
            }
        }
        return 'done';
    };
    module.exports.UNDOADD = (bind_i) => {compareStore.dispatch(undoAddADGroup(bind_i));};
    module.exports.UPDATE = (bind_i, fullControl) => {compareStore.dispatch(updateADGroup(bind_i, fullControl));};
    compareStore.subscribe(() => {
       const myCurrentState = compareStore.getState();
       const myElement = $('#remove_reporting_body');
        myElement.empty();
        let cantEditGroups=[];
        let addedGroups =[];
        myCurrentState.groupsAdded.forEach((val) =>{
            addedGroups +=  `${(val.dn).split(",")[0].slice(3)}\r\n <br>`;
        });
        const LISTofCantEditGroups = myCurrentState.adGroupsToCompare.filter(function(obj){return obj.fullControl == false;});
        LISTofCantEditGroups.forEach((val) => {
            cantEditGroups +=  `${(val.dn).split(",")[0].slice(3)}\r\n <br>`;
        });
        const myHTML = `I added ${$('#user2sName').text()} to the following AD Groups:${addedGroups}<br>I didn't have access to add them to:<br>${cantEditGroups}`;
        myElement.append(myHTML);
    });

};