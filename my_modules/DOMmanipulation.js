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
    $('#queryingSign').toggleClass('hidden');
    $('#useroutputarea').slideToggle("slow", "swing");//spiffy animation
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

module.exports.compare_addADGroup_error = (data => {
        $(`#copyGroupBtn${data[0].bind_i}`).addClass("amber").removeClass("green");
        $('#redMessageBar').html(data[1]);  
    });

module.exports.compare_removeADGroup = (output => {
    const data = JSON.parse(output);
    if(data[0].Result==="Success"){
        $(`#copyGroupBtn${data[0].bind_i}`).slideToggle('slow').removeClass('disabled').addClass('green').removeClass('pulse');
        $(`#additionalGroup${data[0].bind_i}`).remove();
    }else{
        $('#redMessageBar').html(data[1]);
    }
    return;
});

module.exports.remove_parseListOfGroups = ((groupNamesList, user1name) => {
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
            <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="REM-ADGroupBtn${index}">
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
    $('#remUserHeading').html(`<h4>${user1name}</h4>`);
});

module.exports.remove_readd = ((data) => {
    $(`#REM-Row-${data[0].bind_i}`).slideToggle('slow');
    $(`#REM-ADGroupBtn${data[0].bind_i}`).removeClass('disabled pulse');
    $('#undoRemBtn').removeClass('pulse');
});