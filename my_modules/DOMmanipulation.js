

//the parse functions dont actually manipulate the DOM they just build the HTML
module.exports.compare_parseMatching = (groupName => {
return `<li class="brown z-depth-3 tooltipped darken-4" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${groupName}</li>`;
});

module.exports.compare_parseUser1Unique = ((i, groupName) => {
    return `
    <li class="white blue-text row z-depth-2 valign-wrapper">
        <div class="col s1 m1 l1">
            <div class="${i===0?`led-yellow`:`led-blue`}" id="LED-${i}"></div>
        </div>
        <div class="col s11 m11 l11 blue-text text-darken-3 roboto">
            ${groupName}
            <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="copyGroupBtn${i}">
                <i class="close material-icons large">add</i>
            </div>
        </div>
    </li>
    `;
});

module.exports.compare_parseUser2Unique = ((u1Name, groupName) => {
return `<li class="z-depth-3 wood-color tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group ${u1Name} is not in.">${groupName}</li>`;
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
        $('#historyTabList').append(`<li> Added ${data[0].userName} to ${data[0].groupDN} </li>`);
    });

module.exports.compare_addADGroup_error = (data =>{
        $(`#copyGroupBtn${data[0].bind_i}`).addClass("amber").removeClass("green");
        $('#redMessageBar').html(data[1]);  
    });

module.exports.compare_removeADGroup = (output =>{
    const data = JSON.parse(output);
    if(data[0].Result==="Success"){
        $(`#copyGroupBtn${data[0].bind_i}`).slideToggle('slow').removeClass('disabled').addClass('green').removeClass('pulse');
        $(`#additionalGroup${data[0].bind_i}`).remove();
    }else{
        $('#redMessageBar').html(data[1]);
    }
    return;
});