const powershell = require('node-powershell');
const { Set } = require('immutable');

const _removeADGroup = (groupDN, user2, i) => {
    let thisCopyBtn = $(`#copyGroupBtn${i}`),
        thisAddGroupEle = $(`#additionalGroup${i}`);
    let psxAsync = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
        });
        psxAsync.addCommand(`./remove-adGroupMember.ps1 -user '${user2}' -group '${groupDN}' -i ${i}`);
        psxAsync.invoke()
        .then(output => {
            psxAsync.dispose();
            const data = JSON.parse(output);
            if(data[0].Result==="Success"){
                thisCopyBtn.slideToggle('slow').removeClass('disabled').addClass('green').removeClass('pulse');
                thisAddGroupEle.remove();
                $('#historyTabList').append(`<li> Removed ${user2} from ${data[0].groupDN} </li>`);
            }else{
                $('#redMessageBar').html(data[1]);
            }
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
                $(`#copyGroupBtn${data[0].bind_i}`).slideToggle('slow');
                $(`#user2`).append(`
                <ul id="additionalGroup${data[0].bind_i}">
                <li class="brown z-depth-3 tooltipped accent-1" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">
                    ${data[0].groupName}
                    <div class="chip right btn-flat waves-effect waves-light right white brown-text lighten-1 z-depth-2" id="undoGroupBtn${data[0].bind_i}">
                        <span class="undo">undo</span>
                    </div>
                </li>
                </ul>
                `);  
                $('#historyTabList').append(`<li> Added ${names.user2Name} to ${data[0].groupDN} </li>`);
                let myUndoBtn = $(`#undoGroupBtn${data[0].bind_i}`);
                myUndoBtn.click(() => {
                    myUndoBtn.addClass('pulse').addClass('disabled');
                    //names.user2Name never changes  Thats why we don't have to bind it
                    _removeADGroup(data[0].groupDN, names.user2Name, data[0].bind_i);
                });
            }else{
                $(`#copyGroupBtn${data[0].bind_i}`).addClass("amber").removeClass("green");
                $('#redMessageBar').html(data[1]);
            }
        })
        .catch(err => { 
                psAsync.dispose();
            });
    };



module.exports.COMPARE = (outputfromPS, names) => {
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
        let groupName = value.split(",")[0].slice(3);
        letUser1Output +=`
            <li class="white blue-text row z-depth-2 valign-wrapper">
                <div class="col s1 m1 l1">
                    <div class="${i==0?`led-yellow`:`led-blue`}" id="LED-${i}"></div>
                </div>
                <div class="col s11 m11 l11 blue-text text-darken-3 roboto">
                    ${groupName}
                    <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="copyGroupBtn${i}">
                        <i class="close material-icons large">add</i>
                    </div>
                </div>
            </li>
        `;
        adGroupDNs[i]=value;
        i++;
    });
    
    let letUser2Output = `<ul class="listFont">`;
    user2UniqGroups.forEach(function (value){
        let groupName = value.split(",")[0].slice(3);
        letUser2Output += `<li class="z-depth-3 wood-color tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group ${name.u1Name} is not in.">${groupName}</li>`;
    });

    matchingGroups.forEach(function (value){
        let groupName = value.split(",")[0].slice(3);
        letUser1Output += `<li class="brown z-depth-3 tooltipped darken-4" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${groupName}</li>`;
        letUser2Output += `<li class="brown z-depth-3 tooltipped darken-4" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${groupName}</li>`;
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
    const outputAsJSON = JSON.parse(outputfromPS);
    outputAsJSON.user1sGroups.forEach((val) => {
        //need a target div to put output in
    });
};