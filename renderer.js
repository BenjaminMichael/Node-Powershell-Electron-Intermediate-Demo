//todo:
//
//make it look better overall  -standard tab design.  make the purple footger look good on big monitors.  fix text input color.  the screen that slides up could be wooden
//
//we need a reset button
//
//is there any way to stop the horizontal scrolling with clouds css?
//
//set cursor focus in the compare field when tab is clicked
//make hitting [enter] submit the form
//
//
//design modal and wire it up to data store for reporting
//
//make welcome tab more informative
//
// cache icons and any other web assets locally

//renderer.js

var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];
const powershell = require('node-powershell');
window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js'); // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js'); // The sequence of these requires is important
require('materialize-css');
const myModules = require('./my_modules/validate-userNames.js');

$(document).ready(() => {
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for Materialize's sass to make the tabs font color white
    $('.tooltipped').tooltip({delay: 50}); //initialize tooltips
    $('#yourNameHere').html(userName); //update DOM with current users name

    $('#btnCompare').click(() => {
        //you can only use one tab per session
        $('#removeTabButton').addClass('disabled grey').removeClass('brown');
        //check to see if its "ready" so it cant be activated more than one time
        $(this).addClass('disabled');
        myModules.compareBtnClickedUpdateDOM();
        myModules.validateMyList($('#user1Input').val(), $('#user2Input').val(), userName);
       
    });
    $('#btnRemove').click(() => {
        //you can only use one tab per session
        $('#compareTabButton').addClass('disabled grey').removeClass('brown');
        //check to see if its "ready" so it cant be activated more than one time
        $(this).addClass('disabled');
        myModules.removeBtnClickedUpdateDOM();
        myModules.validateMySingleUser($('#removeGroupsInput').val(), userName);
    });
});