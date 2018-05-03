const powershell = require('node-powershell');
const RemoveStore = require('./removeStore.js'); //redux datastore
const CompareStore = require('./compareStore.js'); //redux datastore
const { Set } = require('immutable');
const DOM = require('./DOMmanipulation.js'); //I use this module for most of the times I need to manipulate the user interface 
const Queue = require('better-queue');
const ipcRenderer = require('electron').ipcRenderer;

const log = (string) => ipcRenderer.send('log', string);
const ps = new powershell({executionPolicy: 'Bypass', noProfile: true});

const doPowerShell = (input, cb) => {
    let {workflow, step, payload} = input;
    switch (workflow){
        case "Remove":
        switch(step){
            case "get-ADUser":
            ps.addCommand(`./scripts/get-ADUser -u1 ${payload.user1Name} -cu ${payload.currentUser}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "get-adPrincipalGroups":
            ps.addCommand(`./scripts/get-adPrincipalGroups.ps1 -user1 '${payload.user1DN}' -cu '${payload.currentUser}' -user1FName ${payload.FName} -user1LName ${payload.LName}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "add-ADGroupMember":
            ps.addCommand(`./scripts/add-adGroupMember.ps1 -user '${payload.targetUserDN}' -group '${payload.targetGroupName}' -i ${payload.i} -workflow ${workflow}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "remove-ADGroupMember":
            ps.addCommand(`./scripts/remove-adGroupMember.ps1 -user '${payload.targetUserDN}' -group '${payload.targetGroupName}' -i ${payload.i} -workflow ${workflow}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "get-EffectiveAccess":
            let targetElement = $(`#REM-LED-${payload.i}`);
            if (targetElement.hasClass('led-green') || targetElement.hasClass('led-red')) { return cb(null, null); } else {
                targetElement.addClass("led-yellow").removeClass("led-blue");
                ps.addCommand(`./scripts/get-effective-access.ps1 -adgroupdn '${payload.groupDN}' -i ${payload.i} -workflow ${workflow} -targetUserDN '${payload.targetUserDN}'`);
                ps.invoke().then(output => cb(null, null));
            }
            break;
        }
        break;
        case "Compare":
        switch(step){
            case "get-ADUser":
            ps.addCommand(`./scripts/get-ADUser -u1 ${payload.user1Name} -cu ${payload.currentUser} -u2 ${payload.user2Name}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "get-adPrincipalGroups":
            ps.addCommand(`./scripts/get-adPrincipalGroups.ps1 -user1 '${payload.user1DN}' -cu '${payload.currentUser}' -user2 '${payload.user2DN}'`);
            ps.invoke();
            break;
            case "add-ADGroupMember":
            ps.addCommand(`./scripts/add-adGroupMember.ps1 -user '${payload.targetUserDN}' -group '${payload.targetGroupName}' -i ${payload.i} -workflow ${workflow}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "remove-ADGroupMember":
            ps.addCommand(`./scripts/remove-adGroupMember.ps1 -user '${payload.targetUserDN}' -group '${payload.targetGroupName}' -i ${payload.i} -workflow ${workflow}`);
            ps.invoke().then(output => cb(null, null));
            break;
            case "get-EffectiveAccess":
            let thatLEDElement = $(`#LED-${payload.i}`);
            if (thatLEDElement.hasClass('led-green') || thatLEDElement.hasClass('led-red')) { return cb(null, null); } else {
                $(`#LED-${payload.i}`).addClass("led-yellow").removeClass("led-blue");
                ps.addCommand(`./scripts/get-effective-access.ps1 -adgroupdn '${payload.groupDN}' -i ${payload.i} -workflow ${workflow} -targetUserDN '${payload.targetUserDN}'`);
                ps.invoke().then(output => cb(null, null));
            }
            break;
        }
        break;
    }
};


PSQueue = new Queue(function (input, cb) {
    doPowerShell(input, cb);
}, {afterProcessDelay: 10, maxTimeout: 25000, batchSize: 1});

const evaluatePSOutput = (data) => {
    switch(data[0].Result){
        case "Get-ADUser Remove Error":
            DOM.resetMyRemoveForm(); //error occurred, reset form
            $('#redMessageBar').html(data[0].Error.Message);
        break;
        case "Get-ADUser Compare Error":
            DOM.resetMyCompareForm(); //error occurred, reset form
            $('#redMessageBar').html(data[0].Error.Message);
        break;
        case "Get-ADUser Compare":
            if (data[2].Value.ModuleFound === false) { $('#redMessageBar').html(`This program cannot check your effectice permissions without PowerShell Access Control Module.  Please reinstall the program as administrator.  You can download it from the internet and unzip it to C:\\Program Files\\WindowsPowerShell\\Modules but you will still need local admin to do that.`); return; };
            if (data[0].Error !== false) {
                DOM.resetMyCompareForm(); //error occurred, reset form
                $('#redMessageBar').html(data[0].Error.Message); //report the error
                return; //end the function
            } else {
                $('#user1').append(`<h4 class="brown-text text-darken-3">${data[0].UserName}</h4><h3 class="brown-text text-darken-3">${data[0].FName ? data[0].FName : "-"}&nbsp;${data[0].LName ? data[0].LName : "-"}</h3>`);
                $('#user2').append(`<h4 class="brown-text text-darken-3" id="user2sName">${data[1].UserName}</h4><h3 "brown-text text-darken-3">${data[1].FName ? data[1].FName : "-"}&nbsp;${data[1].LName ? data[1].LName : "-"}</h3><ul class="blue darken-1"><span class="amber-text text-lighten-1">`);
                $('#queryingSign').html(`Checking ${data[0].UserName} and ${data[1].UserName}<br><h3>${data[0].FName ? data[0].FName : "-"}&nbsp;and&nbsp;${data[1].FName ? data[1].FName : "-"}</h3>`);
                //this line is slowing down my program why?  gc?
                doPowerShell({workflow: 'Compare', step: 'get-adPrincipalGroups', payload: {currentUser: data[0].CurrentUser, user1DN: data[0].DN.toString(), user2DN: data[1].DN.toString()}});
                
            }
        break;
        case "Get-ADUser Remove":
            if (data[2].Value.ModuleFound === false) { $('#redMessageBar').html(`This program cannot check your effectice permissions without PowerShell Access Control Module.  Please reinstall the program as administrator.  You can download it from the internet and unzip it to C:\\Program Files\\WindowsPowerShell\\Modules but you will still need local admin to do that.`); return; };
            if (data[0].Error !== false) {
                DOM.resetMyRemoveForm(); //error occurred, reset form
                $('#redMessageBar').html(data[0].Error.Message); //report the error
                return; //end the function
            } else {
            PSQueue.push({workflow: 'Remove', step: 'get-adPrincipalGroups', payload: {currentUser: data[0].CurrentUser, user1DN: data[0].DN, FName:data[0].FName, LName:data[0].LName}});
            }
        break;
        case "Get-ADPrincipalGroupMembership Remove":
            const groupNamesList = RemoveStore.CREATE(data[0].user1sGroups, data[0].user1Name, data[0].currentUser);
            DOM.remove_parseListOfGroups(groupNamesList, data[0].user1Name, data[0].FName, data[0].LName);
    
            $('#undoRemBtn').click(() => {
                $('#undoRemBtn').addClass('pulse disabled');
                PSQueue.push(RemoveStore.UNDO());
            });
            
            REMOVE(groupNamesList, data[0].currentUser, data[0].user1Name);
        break;
        case "Get-ADPrincipalGroupMembership Compare":
            const user1 = Set(data[0].user1sGroups);
            const user2 = Set(data[0].user2sGroups);
            const matchingGroups = (user1.intersect(user2));
            const user1UniqGroups = user1.subtract(matchingGroups);
            const user2UniqGroups = user2.subtract(matchingGroups);
            const myADGroupArray = [...user1UniqGroups];
            CompareStore.CREATE(user1UniqGroups, data[0].user1Name, data[0].currentUser);
            let letUser1Output = `<ul>`;
            myADGroupArray.forEach((value, index) => {
                letUser1Output += DOM.compare_parseUser1Unique(value, index);
            });
            let letUser2Output = `<ul class="listFont">`;
            user2UniqGroups.forEach(function (value) {
                letUser2Output += DOM.compare_parseUser2Unique(data[0].user1Name, value);
            });
            matchingGroups.map(function (value) {
                const groupName = value.split(",")[0].slice(3);
                letUser1Output += DOM.compare_parseMatching(groupName);
                letUser2Output += DOM.compare_parseMatching(groupName);
            });
            DOM.compare_parseListFinalStep(letUser1Output, letUser2Output);

            const max = myADGroupArray.length;
            //this if statement should probably be altered
            if (max < 1) {
                return; //no need to keep going if theres no groups to check effective access against
            }
            setTimeout(50,COMPARE(myADGroupArray, data[0].currentUser, data[0].user2Name)); //user2Name is really user 2's DN
        break;
        case "Add-ADGroupMember Remove":
            log(`added ${data[0].user} to ${data[0].groupDN}`);
            DOM.remove_readd(data[0].bind_i);
        break;
        case "Add-ADGroupMember Compare":
            DOM.compare_addADGroup_success(data);
            CompareStore.ADD(data);
            $(`#undoGroupBtn${data[0].bind_i}`).click(function () {
                $(this).addClass('pulse disabled');
                PSQueue.push({ workflow: "Compare", step: "remove-ADGroupMember" , payload: {targetGroupName: data[0].groupDN, targetUserDN: data[0].user, i: data[0].bind_i }});
            });
            log(`added ${data[0].user} to ${data[0].groupDN}`);
        break;
        case "Remove-ADGroupMember Remove":
        log(`removed ${data[0].userDN} from ${data[0].groupDN}`);
        $(`#REM-Row-${data[0].bind_i}`).slideToggle('slow');
        RemoveStore.REMEMBER(data[0].bind_i, data[0].groupDN);
    break;
    case "Remove-ADGroupMember Compare":
        log(`removed ${data[0].userDN} from ${data[0].groupDN}`);
        DOM.compare_removeADGroup(data[0].bind_i);
        CompareStore.UNDOADD(data[0].bind_i);
    break;
    case "Get-EffectiveAccess Compare":
        let thisLEDElement = $(`#LED-${data[0].bind_i}`);
        if (thisLEDElement.hasClass('led-green') || thisLEDElement.hasClass('led-red')) { return; } else {
            if (!data[0].AccessData.includes("FullControl")) {
                CompareStore.UPDATE(data[0].bind_i, false);
                $(`#LED-${data[0].bind_i}`).addClass("led-red").removeClass("led-yellow");
            } else {
                CompareStore.UPDATE(data[0].bind_i, true);
                $(`#LED-${data[0].bind_i}`).addClass("led-green").removeClass("led-yellow");
                $(`#copyGroupBtn${data[0].bind_i}`).slideToggle("slow").click(function () {
                    //disable btn immediately so you cant spam it
                    $(this).addClass('disabled pulse').removeClass("green");
                    PSQueue.push({  workflow: "Compare", step: 'add-ADGroupMember', payload: {targetGroupName: data[0].targetGroupName, targetUserDN: data[0].targetUserDN, i: data[0].bind_i} });
                });
            }
        }
    break;
    case "Get-EffectiveAccess Remove":
        let anLEDElement = $(`#LED-${data[0].bind_i}`);
        if (anLEDElement.hasClass('led-green') || anLEDElement.hasClass('led-red')) { return cb(null, null); } else {
            if (!data[0].AccessData.includes("FullControl")) {
                RemoveStore.UPDATE(data[0].bind_i, false);
                $(`#REM-LED-${data[0].bind_i}`).addClass("led-red").removeClass("led-yellow");
            } else {
                RemoveStore.UPDATE(data[0].bind_i, true);
                $(`#REM-LED-${data[0].bind_i}`).addClass("led-green").removeClass("led-yellow");
                $(`#REM-ADGroupBtn${data[0].bind_i}`).slideToggle("slow").click(function () {
                    //disable btn immediately so you cant spam it
                    $(this).addClass('disabled pulse');
                    PSQueue.push({workflow: "Remove", step: 'remove-ADGroupMember', payload: {targetGroupName: data[0].targetGroupName, targetUserDN: data[0].targetUserDN, i: data[0].bind_i}});
                });
            }
        }
    break;
    }
    return;
};

ps.on('output', output =>{
    let data;
    try{
       data = JSON.parse(output);
    console.log("PowerShell returning data: " + output);
        evaluatePSOutput(data);
    }
    catch(err){
        console.log('EOI error');
        let outputChunks = output.split(`EOI`);
        outputChunks.forEach(chunk => {
            let myData=JSON.parse(chunk);
            evaluatePSOutput(myData);
        });
    }
});

module.exports.beginCompare = ((userName) => {
    $('#removeTabButton').addClass('disabled grey').removeClass('brown'); //you can only use one tab per session so we disable on click
    DOM.compareBtnClickedUpdateDOM();
    let u1=$('#user1Input').val(), u2=$('#user2Input').val();
    if (u1 === "" || u2 === "") { //do not accept blank input fields
        setTimeout(function () {
            DOM.resetMyCompareForm();
            $('#redMessageBar').html(`You must enter 2 uniqnames`);
        }, 1000);  //if you dont wait for 1000 its too fast for the other animations
        return; //end the function before we even begin our PS process if theres a blank input field
    }    
    PSQueue.push({workflow: "Compare", step: "get-ADUser", payload: {'user1Name': u1, 'currentUser': userName, 'user2Name': u2}});
});

module.exports.beginRemove = ((userName) => {
    $('#compareTabButton').addClass('disabled grey').removeClass('brown'); //you can only use one tab per session so we disable on click
    DOM.removeBtnClickedUpdateDOM();
    let u1=$('#removeGroupsInput').val();
    if (u1 === "") { //do not accept blank input fields
        setTimeout(function () {
            DOM.resetMyRemoveForm();
            $('#redMessageBar').html(`You must enter a uniqname`);
        }, 1000);  //if you dont wait for 1000 its too fast for the other animations
        return; //end the function before we even begin our PS process if theres a blank input field
    }
    PSQueue.push({workflow: "Remove", step: "get-ADUser", payload: {'user1Name': u1, 'currentUser': userName}});
});

const COMPARE = (myADGroupArray, currentUser, targetUser2DN) => {
    PSQueue.on('drain', function (result) {
        //on "drain" determine if there were any that timed out

            let missedGroup = CompareStore.GETANYMISSED();//this just returns the i value for the first group that hasnt had effective access verified
            if (missedGroup === 'done') {
                ps.addCommand(`write-host "[{}]"`);
                ps.invoke();
                return;
            } else {
                PSQueue.push({workflow: "Compare", step: 'get-EffectiveAccess', payload: {groupDN: missedGroup.groupDN, currentUser: currentUser, i: missedGroup.i}});
            }
        
    });
    let max = myADGroupArray.length;
    if (max < 1) {return;}
    myADGroupArray.forEach((group, index) => {
        PSQueue.push({workflow: "Compare", step: "get-EffectiveAccess", payload: {groupDN: group, currentUser: currentUser, i: index, targetUserDN: targetUser2DN}});
    });
};

const REMOVE = (groupNamesList, currentUser, targetUserDN) => {
    PSQueue.on('drain', function (result) {
        //on "drain" determine if there were any that timed out
            let missedGrouptoo = RemoveStore.GETANYMISSED();//this just returns the i value for the first group that hasnt had effective access verified
            if (missedGrouptoo === 'done') {
                ps.addCommand(`write-host '[{}]'`);
                ps.invoke();
                return;
            } else {
                PSQueue.push({workflow: "Remove", step: 'get-EffectiveAccess', payload: {groupDN: missedGroup.groupDN, currentUser: currentUser, i: missedGroup.i}});
            }
        
    });
    let max = groupNamesList.length;
    if (max < 1) {return;}
    groupNamesList.forEach((group, index) => {
        PSQueue.push({workflow: "Remove", step: 'get-EffectiveAccess', payload: {groupDN: group, currentUser: currentUser, i: index, targetUserDN: targetUserDN}});
    });
};