const powershell = require('node-powershell');
const { Set } = require('immutable');
const Redux = require('./store.js');
const DOM = require('./DOMmanipulation.js');

module.exports.COMPARE = (outputfromPS, names) => {

    const _removeADGroup = (groupDN, user2, i) => {
        let psxAsync = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
            });
            psxAsync.addCommand(`./remove-adGroupMember.ps1 -user '${user2}' -group '${groupDN}' -i ${i}`);
            psxAsync.invoke()
            .then(output => {
                psxAsync.dispose();
                DOM.compare_removeADGroup(output);
            })
            .catch(err => { 
                    psxAsync.dispose();
                });          
    };

    const _addADGroup = (targetGroupName, names, i) => { 
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
                let myUndoBtn = $(`#undoGroupBtn${data[0].bind_i}`);
                myUndoBtn.click(() => {
                    myUndoBtn.addClass('pulse').addClass('disabled');
                    _removeADGroup(data[0].groupDN, data[0].userName, data[0].bind_i);
                });
            }else{DOM.compare_addADGroup_error(data);}
        })
        .catch(err => { 
                psAsync.dispose();
        });
    };

    const user1and2JSONfromPS = JSON.parse(outputfromPS);
    const user1 = Set(user1and2JSONfromPS.user1sGroups);
    const user2 = Set(user1and2JSONfromPS.user2sGroups);
    const matchingGroups = (user1.intersect(user2));
    const user1UniqGroups = user1.subtract(matchingGroups);
    const user2UniqGroups = user2.subtract(matchingGroups);
    let letUser1Output = `<ul>`;
    let cu =  names.currentUser,
    adGroupDNs=[],
    i=0; //we use i to count our DOM elements naming them id=LED-i, id=copyGroupBtni, and id=undoGroupBtni
    //the only elements that get counted are user 1's unique group memberships.
    //this is to establish a "counting sort" of the UI elements
    //each time async code finishes it updates id=LED-i
    user1UniqGroups.forEach((value)=>{
        const groupName = value.split(",")[0].slice(3);
        letUser1Output += DOM.compare_parseUser1Unique(i, groupName);
        adGroupDNs[i]=value; //sets are great for doing the intersect and subtract methods but now that we've done that we really need the values to be indexed like an array
        i++;
    });
    let letUser2Output = `<ul class="listFont">`;
    user2UniqGroups.forEach(function (value){
        const groupName = value.split(",")[0].slice(3);
        letUser2Output += DOM.compare_parseUser2Unique(names.u1Name, groupName);
    });
    matchingGroups.forEach(function (value){
        const groupName = value.split(",")[0].slice(3);
        const temp = DOM.compare_parseMatching(groupName);
        letUser1Output += temp;
        letUser2Output += temp;
    });
    letUser1Output +='</ul>';
    letUser2Output +='</ul>';

    $('#user1').append(letUser1Output); //append our newly made HTML to the DOM
    $('#user2').append(letUser2Output); 
    $('#emptyRow').empty(); //remove the prelaunch progressbar
    $('#queryingSign').toggleClass('hidden');
    $('#useroutputarea').slideToggle("slow", "swing");//spiffy animation
    
    $('.tooltipped').tooltip(); //dynamic tooltip init for our new HTML

    //At this point the user has two lists to visually compare.
    //Next we check if the current user has access to add user2 to user1's groups.
    //If they can, it will add a green + button to the element.

    const max=user1UniqGroups.count();
    let psChain = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
    const doPowerShell = (i) => { 
        $(`#LED-${i}`).addClass("led-yellow").removeClass("led-blue");
        psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${adGroupDNs[i]}' -me ${names.currentUser} -i ${i}`);
        psChain.invoke();
        return;
    };
    psChain.on('output', output => {
        const data = JSON.parse(output);   
        if(!data.Result.includes("FullControl")){
            $(`#LED-${data.bind_i}`).addClass("led-red").removeClass("led-yellow");
        }else{
            $(`#LED-${data.bind_i}`).addClass("led-green").removeClass("led-yellow");
            $(`#copyGroupBtn${data.bind_i}`).slideToggle("slow").click(function(){
                //disable btn immediately so you cant spam it
                $(this).addClass('disabled').addClass('pulse').removeClass("green");
                _addADGroup(data.targetGroupName, names, data.bind_i);
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

    const _readdGroup = (reduxStoreOutput) => {
        const {userDN, groupDN, undoCount, i} = reduxStoreOutput;
        if(undoCount===1){
            $('#undoRemBtn').addClass('disabled');
        };
        let psReadd = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
            });
            psReadd.addCommand(`./add-adGroupMember.ps1 -user '${userDN}' -group '${groupDN}' -i ${i}`); //i doesnt matter
            psReadd.invoke()
            .then(output => {
                psReadd.dispose();
                const data = JSON.parse(output);
                if(data[0].Result==="Success"){
                    DOM.remove_readd(data);
                }else{
                    $('#redMessageBar').html(data[1]);
                }   
            })
            .catch((err) => {
                console.log(err);
            });
            
        };

    const _remGroup = (groupDN, userDN, i) => {
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
                    Redux.REMEMBER(data[0].userDN, data[0].groupDN, data[0].bind_i);
                    $('#undoRemBtn').removeClass('disabled');
                }else{
                    $('#redMessageBar').html(data[1]);
                }
            })
            .catch(err => {
                console.log(err);
            });
        };


    const myJSON = JSON.parse(outputfromPS);
    const groupNamesList = Set(myJSON.user1sGroups);
    
    
    let i=0,
    cu =  names.currentUser,
    adGroupDNsToRem=[];
    var htmlOutput = `<ul class="brown lighten-3" id="remGroupUL">`;
    groupNamesList.forEach((val) => {
        //to parse the group name out of the DN use val.split(",")[0].slice(3) 
        htmlOutput+=`
        <li class="white row z-depth-2 valign-wrapper" id="REM-Row-${i}">
        <div class="col s1 m1 l1">
            <div class="${i===0?`led-yellow`:`led-blue`}" id="REM-LED-${i}"></div>
        </div>
        <div class="col s11 m11 l11 brown-text text-darken-3 roboto">
        ${val.split(",")[0].slice(3)}
            <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="REM-ADGroupBtn${i}">
                <i class="close material-icons large">remove</i>
            </div>
        </div>
        </li>
        `;
        adGroupDNsToRem[i]=val;
        i++;
    });
    htmlOutput+=`</ul>`;
    $('#emptyRow').empty();
    $('#user1RemoveList').append(htmlOutput);
    $('#user1RemoveList, #hiddenUndoBtnRow').slideToggle("slow", "swing");
    $('#queryingSignRemoveTab').slideToggle('slow');
    $('#remUserHeading').html(`<h3>(${names.user1Name})</h3>`);
    //set the undo button click handler one time
    $('#undoRemBtn').click(() => {
        _readdGroup(Redux.UNDO());
    });
    //iterate through all the groups to check effective access
    let max = adGroupDNsToRem.length;
    let psChain = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
    const doPowerShell = (i) => {
        let adg = adGroupDNsToRem[i];
        $(`#REM-LED-${i}`).addClass("led-yellow").removeClass("led-blue");
        psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${adg}' -me ${cu} -i ${i}`);
        psChain.invoke();
        return;
    };
    psChain.on('output', output => {
        const data = JSON.parse(output);   
        if(!data.Result.includes("FullControl")){
            $(`#REM-LED-${data.bind_i}`).addClass("led-red").removeClass("led-yellow");
        }else{
            $(`#REM-LED-${data.bind_i}`).addClass("led-green").removeClass("led-yellow");
            $(`#REM-ADGroupBtn${data.bind_i}`).slideToggle("slow").click(function(){
                //disable btn immediately so you cant spam it
                $(this).addClass('disabled pulse');
                _remGroup(data.targetGroupName, names.user1DN, data.bind_i);
                });
            }
        if (data.bind_i<max-1){let i = data.bind_i+1;return doPowerShell(i);}else{psChain.dispose();return;};
        });
        psChain.on('err', err => {
            $('#redMessageBar').html(err);
        });
        if(max>0){doPowerShell(0);}else{return;};
};