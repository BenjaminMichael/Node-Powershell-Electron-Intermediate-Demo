const remote = require('electron').remote;
const {clipboard} = require('electron');


const RESTART = () => {
    remote.app.relaunch();
    remote.app.exit(0);
};

const COPYTOCLIPBOARD = () => {
let myText = $('#remove_reporting_body').html();
myText = myText.split('<br>');
let formattedText ="";
myText.forEach(line => {formattedText += `${(line.toString())}\r\n`;});
clipboard.writeText(formattedText);

};

module.exports.compareBtnClickedUpdateDOM = (() => {
    $('.mainForm').addClass("disabled");
    $('#clickToCopy').click(() => {
        COPYTOCLIPBOARD();
    });
    $('#compareRestartBtn').click(() => {
        RESTART();
    });
    $('#redMessageBar').empty();
    setTimeout(function(){
        $('#queryingSign').slideToggle("slow");
        $('#userinputarea').slideToggle("slow");
        $('#emptyRow').html(`<div class="row center">
                                <div class="progress">
                                    <div class="indeterminate"></div>
                                </div>  
                            </div>`);},500);
    });

module.exports.removeBtnClickedUpdateDOM = (() => {
    $('#removeGroupsInput').addClass("disabled");
    $('#redMessageBar').empty();
    $('#clickToCopy').click(() => {
        COPYTOCLIPBOARD();
    });
    setTimeout(function(){
        $('#queryingSignRemoveTab').slideToggle('swing');
        $('#removeuserinputarea').slideToggle("slow");
        $('#emptyRow').html(`<div class="row center">
                                <div class="progress">
                                    <div class="indeterminate"></div>
                                </div>  
                            </div>`);},500);
    });

module.exports.resetMyRemoveForm = (() => {
        $('#removeGroupsInput').removeClass("disabled");
        $('#removeuserinputarea').slideToggle("slow");
        $('#emptyRow').empty();
        $('#btnRemove').addClass('ready');
        $('#queryingSignRemoveTab').slideToggle().addClass('hidden');
        $('#removeuserinputarea').removeClass('notReady');
});

module.exports.resetMyCompareForm = (() => {
    $('.mainForm').removeClass("disabled");
    $('input').removeClass('notReady');
    $('#userinputarea').slideToggle("slow");
    $('#emptyRow').empty();
    $('#btnCompare').addClass('ready');
    $('#useroutputarea').addClass('hidden');
    $('#queryingSign').slideToggle('slow');
});

module.exports.compare_parseMatching = (groupName => {
return `<li class="brown z-depth-3 tooltipped darken-4" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${groupName}</li>`;
});

module.exports.compare_parseUser1Unique = ((value, i) => {
    const groupName = value.split(",")[0].slice(3);
    return `
    <li class="white row z-depth-2 valign-wrapper">
        <div class="col s1 m1 l1">
            <div class="${i==0?`led-yellow`:`led-blue`}" id="LED-${i}"></div>
        </div>
        <div class="col s11 m11 l11 brown-text text-darken-3">
            ${groupName}
            <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="copyGroupBtn${i}">
                <i class="close material-icons large">add</i>
            </div>
        </div>
    </li>
    `;
});

module.exports.compare_parseUser2Unique = ((u1Name, value) => {
const groupName = value.split(",")[0].slice(3);
return `<li class="z-depth-3 wood-color tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group ${u1Name} is not in.">${groupName}</li>`;
});

module.exports.compare_parseListFinalStep = ((letUser1Output, letUser2Output) => {
    letUser1Output +='</ul>';
    letUser2Output +='</ul>';
    $('#user1').append(letUser1Output);
    $('#user2').append(letUser2Output);
    $('#emptyRow').empty(); //remove the prelaunch progressbar
    setTimeout(function(){$('#queryingSign').slideToggle('slow','swing');},200);
    setTimeout(function(){$('#useroutputarea').slideToggle("slow", "swing");},1500);
    $('.tooltipped').tooltip(); //dynamic tooltip reinitialization for our new HTML
});

module.exports.compare_addADGroup_success = (data =>{  
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
    });

module.exports.compare_removeADGroup = (bind_i => {
        $(`#copyGroupBtn${bind_i}`).slideToggle('slow').removeClass('disabled').addClass('green').removeClass('pulse');
        $(`#additionalGroup${bind_i}`).remove();
    return;
});

module.exports.remove_parseListOfGroups = ((groupNamesList, user1Name, user1FName, user1LName) => {
    let user1ShortName = user1Name.split(",")[0].slice(3);
    var htmlOutput = `<ul class="brown lighten-3" id="remGroupUL">`;
    groupNamesList.forEach((val, index) => {
        //to parse the group name out of the DN use val.split(",")[0].slice(3) 
        htmlOutput+=`
        <li class="white row z-depth-2 valign-wrapper" id="REM-Row-${index}">
        <div class="col s1 m1 l1">
            <div class="${index==0?`led-yellow`:`led-blue`}" id="REM-LED-${index}"></div>
        </div>
        <div class="col s11 m11 l11 black-text">
        ${val.split(",")[0].slice(3)}
            <div class="hidden center btn-floating btn-large waves-effect waves-light right red white-text darken-1 z-depth-2" id="REM-ADGroupBtn${index}">
                <i class="close material-icons large">remove</i>
            </div>
        </div>
        </li>
        `;
    });
    htmlOutput+=`</ul>`;
    $('#emptyRow').empty();
    $('#user1RemoveList').append(htmlOutput);
    $('#user1RemoveList, #hiddenUndoBtnRow').slideToggle("slow", "swing");
    $('#queryingSignRemoveTab').slideToggle('slow');
    $('#remUserHeading').append(`${user1ShortName}`);
    $('#remUserSubHeading').append(`<div>${user1FName?user1FName:"-"}&nbsp;${user1LName?user1LName:"-"}</div>`);
    $('#removeRestartBtn').click(() => {
        RESTART();
    });
});

module.exports.remove_readd = ((i) => {
    $(`#REM-Row-${i}`).slideToggle('slow');
    $(`#REM-ADGroupBtn${i}`).removeClass('disabled pulse');
    $('#undoRemBtn').removeClass('pulse');
});