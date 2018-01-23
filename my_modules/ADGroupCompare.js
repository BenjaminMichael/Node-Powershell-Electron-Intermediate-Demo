const powershell = require('node-powershell');
const ACTIONS = require('./myActions.js');
/*
FUNCTION: listOfGroupsToCompare
 @param {JSON array element} names:
 {String} u1DN distinguished name of "user 1"
 {String} u2DN distinguished name of "user 2"
 {String} u1Name short name of "user 1"
 {String} u2Name short name of "user 2"
 {String} currentUserName short name of the user running this program

 Description: Updates the DOM with a list of both matching and nonmatching group memberships.
 Then it checks User 1's nonmatching groups to see if the current user has permission to add
 User 2 to any of the groups and it updates the DOM accordingly.

PowerShell scripts:
get-adPrincipalGroups to build 2 lists of group memberships to compare
get-effective-access to see if you can add user 2 to any of user 1's groups
add-adgroupmember to add user 2 to user 1's groups 1 at a time
remove-adGroupMember to undo after a group has been added

*/

module.exports.listOfGroupsToCompare = (names) => {
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    }); 
    ps.addCommand(`./get-adPrincipalGroups.ps1 -user1 '${names.user1DN}' -user2 '${names.user2DN}'`);
    ps.invoke()
    .then(output =>  {
        ps.dispose();
        ACTIONS.COMPARE(output, names);
    })
    .catch(err=>{
        $('#redMessageBar').html(err);
        ps.dispose();
    });
};

module.exports.listOfGroupsToRemove = (names) => {
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    }); 
    ps.addCommand(`./get-adPrincipalGroups.ps1 -user1 '${names.user1DN}'`);
    ps.invoke()
    .then(output =>  {
        ps.dispose();
        ACTIONS.REMOVE(output, names);
    })
    .catch(err=>{
        $('#redMessageBar').html(err);
        ps.dispose();
    });
};