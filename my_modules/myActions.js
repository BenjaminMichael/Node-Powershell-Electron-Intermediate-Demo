const powershell = require('node-powershell');
const RemoveStore = require('./removeStore.js');
const CompareStore = require('./compareStore.js');
const {Set} = require('immutable');
const DOM = require('./DOMmanipulation.js');
var Queue = require('better-queue');

module.exports.COMPARE = (outputfromPS, names) => {

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




module.exports.REMOVE = (outputfromPS, names) => {

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