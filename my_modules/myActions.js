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
    let adGroupDNs=[];
    let i=0; //we use i to count our DOM elements naming them id=LED-i, id=copyGroupBtni, and id=undoGroupBtni
    //the only elements that get counted are user 1's unique group memberships.
    //this is to establish a "counting sort" of the UI elements
    //each time async code finishes it updates id=LED-i
    user1UniqGroups.forEach((value)=>{
        const groupName = value.split(",")[0].slice(3);
        letUser1Output += DOM.compare_parseUser1Unique(i, groupName);
        adGroupDNs[i]=value;
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

    const max=adGroupDNs.length;

    function rapidFirePromise(i){
        var  elementID=`#LED-${i}`; 
        $(elementID).addClass("led-yellow").removeClass("led-blue");
        let psChain = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
        psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${adGroupDNs[i]}' -me ${names.currentUser} -i ${i}`);
        psChain.invoke()
        .then(output => {
            psChain.dispose();
        const data = JSON.parse(output);                
            if(!data[0].Result.includes("FullControl")){
            $(elementID).addClass("led-red").removeClass("led-yellow");
        }else{
            $(elementID).addClass("led-green").removeClass("led-yellow");
            $(`#copyGroupBtn${data[1].bind_i}`).slideToggle("slow").click(function(){
                //disable btn immediately so you cant spam it
                $(this).addClass('disabled').addClass('pulse').removeClass("green");
                _addADGroup(data[1].targetGroupName, names, data[1].bind_i);
                });
            }
        if (i<max-1){i++;return rapidFirePromise(i);}
            })
        .catch(err => { 
        
        //in the case of an error in the promise, make the LED red with a tooltip of the error text
        $(elementID).html(`<div class="btn-large red white-text tooltipped" data-position="bottom" data-delay="50" data-tooltip="${err}">ERROR</div>`);

        psChain.dispose();
            });        
    } //end of rapidFirePromise

rapidFirePromise(0);
};


module.exports.REMOVE = (outputfromPS, names) => {

    const _readdGroup = (reduxStoreOutput) => {
        const {undoType, undoUserDN, undoGroupDN, undoCount} = reduxStoreOutput;
        if(undoCount===1){
            $('#undoRemBtn').addClass('disabled');
        };
        /*
        let psReadd = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
            });
            psReadd.addCommand();
            psReadd.invoke()
            .then(output => {
                psRem.dispose();
                const data = JSON.parse(output);
            })
            .catch((err) => {
                console.log(err);
            });
            */
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
                    $(`#REM-Row-${i}`).slideToggle('slow');
                    Redux.REMEMBER(groupDN, userDN);
                    $('#undoRemBtn').removeClass('disabled').click(() => {
                        _readdGroup(Redux.UNDO());
                    });
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
    let i=0;
    let adGroupDNsToRem=[];
    var htmlOutput = `<ul class="brown lighten-3">`;
    groupNamesList.forEach((val) => {
        //to parse the group name out of the DN use val.split(",")[0].slice(3) 
        htmlOutput+=`
        <li class="orange accent-2 row z-depth-2 valign-wrapper" id="REM-Row-${i}">
        <div class="col s1 m1 l1">
            <div class="${i===0?`led-yellow`:`led-blue`}" id="REM-LED-${i}"></div>
        </div>
        <div class="col s11 m11 l11 brown-text text-darken-3 roboto">
        ${val.split(",")[0].slice(3)}
            <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="REM-copyGroupBtn${i}">
                <i class="close material-icons large">remove</i>
            </div>
        </div>
        </li>
        `;
        adGroupDNsToRem[i]=val;
        i++; //we are using i to track the DOM elements we are creating 
    });
    htmlOutput+=`</ul>`;
    $('#emptyRow').empty();
    $('#user1RemoveList').append(htmlOutput);
    $('#user1RemoveList, #hiddenUndoBtnRow').slideToggle("slow", "swing");
    $('#queryingSignRemoveTab').slideToggle('slow');

    let max = adGroupDNsToRem.length;

    function multiPromise(i){
        var  elementID=`#REM-LED-${i}`; 
        $(elementID).addClass("led-yellow").removeClass("led-blue");
        let psChain = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
        psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${adGroupDNsToRem[i]}' -me ${names.currentUser} -i ${i}`);
        psChain.invoke()
        .then(output => {
        const data = JSON.parse(output);
        psChain.dispose();                
            if(!data[0].Result.includes("FullControl")){
            $(elementID).addClass("led-red").removeClass("led-yellow");
        }else{
            $(elementID).addClass("led-green").removeClass("led-yellow");
            $(`#REM-copyGroupBtn${data[1].bind_i}`).slideToggle("slow").click(function(){
                //disable btn immediately so you cant spam it
                $(this).addClass('disabled').addClass('pulse').removeClass("green");
                _remGroup(data[1].targetGroupName, names.user1DN, data[1].bind_i);
                });
            }
        if (i<max-1){i++;return multiPromise(i);}
            })
        .catch(err => { 
        //in the case of an error in the promise, make the LED red with a tooltip of the error text
        $(elementID).html(`<div class="btn-large red white-text tooltipped" data-position="bottom" data-delay="50" data-tooltip="${err}">ERROR</div>`);
            });        
    } //end of multiPromise

multiPromise(0);
};