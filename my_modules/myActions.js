const powershell = require('node-powershell');
const RemoveStore = require('./removeStore.js');
const CompareStore = require('./compareStore.js');
const {Set} = require('immutable');
const DOM = require('./DOMmanipulation.js');
var Queue = require('better-queue');
const remote = require('electron').remote;

const RESTART = () => {
    remote.app.relaunch();
    remote.app.exit(0);
};

module.exports.compareBtnClickedUpdateDOM = () => {
    $('.mainForm').addClass("disabled");
    $('#redMessageBar').empty();
    setTimeout(function(){
        $('#queryingSign').removeClass('hidden');
        $('#userinputarea').slideToggle("slow");
        $('#emptyRow').html(`<div class="row center">
                                <div class="progress">
                                    <div class="indeterminate"></div>
                                </div>  
                            </div>`);},500);
    };

module.exports.removeBtnClickedUpdateDOM = () => {
    $('#removeGroupsInput').addClass("disabled");
    $('#redMessageBar').empty();
    setTimeout(function(){
        $('#queryingSignRemoveTab').removeClass('hidden');
        $('#removeuserinputarea').slideToggle("slow");
        $('#emptyRow').html(`<div class="row center">
                                <div class="progress">
                                    <div class="indeterminate"></div>
                                </div>  
                            </div>`);},500);
    };


module.exports.validateMySingleUser = (u1, userName) => {
    function _resetMyForm(){
        $('#removeGroupsInput').removeClass("disabled");
        $('#removeuserinputarea').slideToggle("slow");
        $('#emptyRow').empty();
        $('#btnRemove').addClass('ready');
        $('#queryingSignRemoveTab').slideToggle('slow');
    }

    if(u1 ===""){
        setTimeout(function(){
            _resetMyForm();
            $('#redMessageBar').html(`You must enter a uniqname`);
        },1000);  //if you dont wait for 1000 its too fast for the other animations
        return; //end the function before we even begin our PS process if theres a blank input field
    }
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    });
    ps.addCommand(`./get-ADUser -u1 ${u1}`);
    ps.invoke()
    .then(output=>{
        ps.dispose();
        const data=JSON.parse(output);
        if(data[3].Value.ModuleFound ===false){$('#redMessageBar').html(`This program cannot check your effectice permissions without PowerShell Access Control Module.  Please reinstall the program as administrator.  You can download it from the internet and unzip it to C:\\Program Files\\WindowsPowerShell\\Modules but you will still need local admin to do that.`);return;};
        if(data[2].Error.Message !== "No error"){
           _resetMyForm(); //error occurred, reset form
           $('#redMessageBar').html(data[2].Error.Message); //report the error
           return; //end the function
        }else{
            
            let names= {
                'user1Name' : u1,
                'user1DN' : (data[0].DN).toString(),
                'currentUser' : userName
            };
            //animation needed
            //$('#queryingSignRemoveTab').slideToggle('slow');
            
            return listOfGroupsToRemove(names);
        }
    })
    .catch(err=>{
        ps.dispose();
    });
};

module.exports.validateMyList = (u1, u2, userName) => {

    function _resetMyForm(){ //DOM manipulation for when the process is cancelled
        $('.mainForm').removeClass("disabled");
        $('#userinputarea').slideToggle("slow");
        $('#emptyRow').empty();
        $('#btnCompare').addClass('ready');
    }

    if (u1 ==="" || u2===""){
        setTimeout(function(){
            _resetMyForm();
            $('#redMessageBar').html(`You must enter 2 uniqnames`);
        },1000);  //if you dont wait for 1000 its too fast for the other animations
        return; //end the function before we even begin our PS process if theres a blank input field
    }

    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    });
    ps.addCommand('./get-ADUser',[{u1:`"${u1}"`},{u2:`"${u2}"`}]);
    ps.invoke()
    .then(output=>{
        ps.dispose();
        const data=JSON.parse(output);
        if(data[3].Value.ModuleFound ===false){$('#redMessageBar').html(`This program cannot check your effectice permissions without PowerShell Access Control Module.  Please reinstall the program as administrator.  You can download it from the internet and unzip it to C:\\Program Files\\WindowsPowerShell\\Modules but you will still need local admin to do that.`);return;};
        if(data[2].Error.Message !== "No error"){
           _resetMyForm(); //error occurred, reset form
           $('#redMessageBar').html(data[2].Error.Message); //report the error
           return; //end the function
        }else{
                let names= {
                    'user1Name' : u1,
                    'user2Name' : u2,
                    'user1DN' : (data[0].DN).toString(),
                    'user2DN' : (data[1].DN).toString(),
                    'currentUser' : userName
                };
                $('#user1').append(`<h4 class="wildwestfontStriped brown-text text-darken-3">${names.user1Name}</h4>`);
                $('#user2').append(`<h4 class="wildwestfontStriped brown-text text-darken-3" id="user2sName">${names.user2Name}</h4><ul class="blue darken-1"><span class="amber-text text-lighten-1">`);
                $('#queryingSign').text(`Checking for ${u1} and ${u2}'s memberships`);
                    return listOfGroupsToCompare(names);
                     }
    })
    .catch(err=>{
        ps.dispose();
    });    
};



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

const listOfGroupsToCompare = (names) => {
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    }); 
    ps.addCommand(`./get-adPrincipalGroups.ps1 -user1 '${names.user1DN}' -user2 '${names.user2DN}'`);
    ps.invoke()
    .then(output =>  {
        ps.dispose();
        COMPARE(output, names);
    })
    .catch(err=>{
        $('#redMessageBar').html(err);
        ps.dispose();
    });
};

const listOfGroupsToRemove = (names) => {
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    }); 
    ps.addCommand(`./get-adPrincipalGroups.ps1 -user1 '${names.user1DN}'`);
    ps.invoke()
    .then(output =>  {
        ps.dispose();
        REMOVE(output, names);
    })
    .catch(err=>{
        $('#redMessageBar').html(err);
        ps.dispose();
    });
};

//compare and remove functions

const COMPARE = (outputfromPS, names) => {

    const _removeADGroup = (groupDN, user2, i, cb) => {
        let psxAsync = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
        psxAsync.addCommand(`./remove-adGroupMember.ps1 -user '${user2}' -group '${groupDN}' -i ${i}`);
        psxAsync.invoke()
        .then(output => {
            data = JSON.parse(output);
            psxAsync.dispose();
            DOM.compare_removeADGroup(output);
            CompareStore.UNDOADD(data[0].bind_i);
            cb(null, null);
        })
        .catch(err => { 
            psxAsync.dispose();
            cb(null, null);
            });          
    };

    const _addADGroup = (targetGroupName, names, i, cb) => { 
        let psAsync = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
            });
        psAsync.addCommand(`./add-adGroupMember.ps1 -user '${names.user2DN}' -group '${targetGroupName}' -i ${i}`);
        psAsync.invoke()
        .then(output => {
            psAsync.dispose();
            const data = JSON.parse(output);     
            if(data[0].Result==="Success"){
                DOM.compare_addADGroup_success(data);
                CompareStore.ADD(data);
                $(`#undoGroupBtn${data[0].bind_i}`).click(function(){
                    $(this).addClass('pulse disabled');
                    addRemoveADGroupQueue.push({type: 'remove', groupDN: data[0].groupDN, user2: data[0].userName, i: data[0].bind_i});
                });
            }else{
                DOM.compare_addADGroup_error(data);
            }
            cb(null, null);
        })
        .catch(err => { 
                psAsync.dispose();
                cb(null, null);
        });
    };

    addRemoveADGroupQueue = new Queue(function (input, cb) {
            switch(input.type){
                case 'remove':
                _removeADGroup(input.groupDN, input.user2, input.i, cb);
                break;
                case 'add':
                _addADGroup(input.targetGroupName, input.names, input.i, cb);
                break;
            }
        });

    const user1and2JSONfromPS = JSON.parse(outputfromPS);
    const user1 = Set(user1and2JSONfromPS.user1sGroups);
    const user2 = Set(user1and2JSONfromPS.user2sGroups);
    const matchingGroups = (user1.intersect(user2));
    const user1UniqGroups = user1.subtract(matchingGroups);
    const user2UniqGroups = user2.subtract(matchingGroups);
    let letUser1Output = `<ul>`;
    const myADGroupArray = [...user1UniqGroups];
    CompareStore.CREATE(user1UniqGroups, names.user1Name, names.currentUser);

    myADGroupArray.forEach((value, index)=>{
        letUser1Output += DOM.compare_parseUser1Unique(value, index);
    });
    let letUser2Output = `<ul class="listFont">`;
    user2UniqGroups.forEach(function (value){
        letUser2Output += DOM.compare_parseUser2Unique(names.u1Name, value);
    });
    matchingGroups.map(function (value){
        const groupName = value.split(",")[0].slice(3);
        letUser1Output += DOM.compare_parseMatching(groupName);
        letUser2Output += DOM.compare_parseMatching(groupName);
    });
    
    DOM.compare_parseListFinalStep(letUser1Output, letUser2Output);
   
    $('#compareRestartBtn').click(() => {
        RESTART();
    });

    //At this point the user has two lists to visually compare.
    //Next we check if the current user has access to add user2 to user1's groups.
    //If they can, it will add a green + button to the element.

    const max=myADGroupArray.length;
    let psChain = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
    const doPowerShell = (i) => { 
        $(`#LED-${i}`).addClass("led-yellow").removeClass("led-blue");
        psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${myADGroupArray[i]}' -me ${names.currentUser} -i ${i}`);
        psChain.invoke();
        return;
    };
    psChain.on('output', output => {
        const data = JSON.parse(output);   
        if(!data.Result.includes("FullControl")){
            CompareStore.UPDATE(data.bind_i, false);
            $(`#LED-${data.bind_i}`).addClass("led-red").removeClass("led-yellow");
        }else{
            CompareStore.UPDATE(data.bind_i, true);
            $(`#LED-${data.bind_i}`).addClass("led-green").removeClass("led-yellow");
            $(`#copyGroupBtn${data.bind_i}`).slideToggle("slow").click(function(){
                //disable btn immediately so you cant spam it
                $(this).addClass('disabled pulse').removeClass("green");
                addRemoveADGroupQueue.push({type: 'add', targetGroupName : data.targetGroupName, names: names, i: data.bind_i});
            });
        }
        if (data.bind_i<max-1){let i = data.bind_i+1;return doPowerShell(i);}else{psChain.dispose();return;};
        psChain.on('err', err => {
            $('#redMessageBar').html(err);
        });
    });
    if(max>0){doPowerShell(0);}else{return;};
};




const REMOVE = (outputfromPS, names) => {

    const _readdGroup = (groupDN, i, cb) => {
        let psReadd = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
            });
            psReadd.addCommand(`./add-adGroupMember.ps1 -user '${names.user1DN}' -group '${groupDN}' -i ${i}`); //i doesnt matter
            psReadd.invoke()
            .then(output => {
                psReadd.dispose();
                const data = JSON.parse(output);
                if(data[0].Result==="Success"){
                    DOM.remove_readd(data);
                    cb(null, null);
                }else{
                    $('#redMessageBar').html(data[1]);
                    cb(null, null);
                }   
            })
            .catch((err) => {
                cb(null, null);
                psReadd.dispose();
            });
        };

    const _remGroup = (groupDN, userDN, i, cb) => {
        let psRem = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
        });
        psRem.addCommand(`./remove-adGroupMember.ps1 -user '${userDN}' -group '${groupDN}' -i ${i}`);
        psRem.invoke()
        .then(output => {
            psRem.dispose();
            const data = JSON.parse(output);
            if(data[0].Result==="Success"){
                $(`#REM-Row-${data[0].bind_i}`).slideToggle('slow');
                RemoveStore.REMEMBER(data[0].bind_i, data[0].groupDN);
                cb(null, null);
            }else{
                $('#redMessageBar').html(data[1]);
                cb(null, null);
            }
        })
        .catch(err => {
            psRem.dispose();
            console.log(err);
            cb(null, null);
        });
    };

    var readdOrRemoveADGroupQueue = new Queue(function (input, cb) {
        switch(input.type){
            case 'remove':
            _remGroup(input.groupDN, input.userDN, input.i, cb);
            break;
            case 'readd':
            _readdGroup(input.groupDN, input.i, cb);
            break;
        }
    });

    const groupNamesList =  RemoveStore.CREATE(outputfromPS, names.user1Name, names.currentUser);
    DOM.remove_parseListOfGroups(groupNamesList, names.user1Name);
    
    $('#undoRemBtn').click(() => {
        $('#undoRemBtn').addClass('pulse disabled');
        readdOrRemoveADGroupQueue.push(RemoveStore.UNDO());
    });
    $('#removeRestartBtn').click(() => {
        RESTART();
    });

    //iterate through all the groups to check effective access
    let max = groupNamesList.length;
    let psChain = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    });
    const doPowerShell = (i) => {
        $(`#REM-LED-${i}`).addClass("led-yellow").removeClass("led-blue");
        psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${groupNamesList[i]}' -me ${names.currentUser} -i ${i}`);
        psChain.invoke();
        return;
    };
    psChain.on('output', output => {
        const data = JSON.parse(output);   
        if(!data.Result.includes("FullControl")){
            RemoveStore.UPDATE(data.bind_i, false);
            $(`#REM-LED-${data.bind_i}`).addClass("led-red").removeClass("led-yellow");
        }else{
            RemoveStore.UPDATE(data.bind_i, true);
            $(`#REM-LED-${data.bind_i}`).addClass("led-green").removeClass("led-yellow");
            $(`#REM-ADGroupBtn${data.bind_i}`).slideToggle("slow").click(function(){
                //disable btn immediately so you cant spam it
                $(this).addClass('disabled pulse');
                readdOrRemoveADGroupQueue.push({type: 'remove', groupDN: data.targetGroupName, userDN: names.user1DN, i: data.bind_i});
            });
        }
        if (data.bind_i<max-1){let i = data.bind_i+1;return doPowerShell(i);}else{psChain.dispose();return;};
    });
    psChain.on('err', err => {
        $('#redMessageBar').html(err);
    });
    if(max>0){doPowerShell(0);}else{return;};
};