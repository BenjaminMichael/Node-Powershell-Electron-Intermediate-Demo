//todo:
//
//make it look better overall  -standard tab design.  make the purple footger look good on big monitors.  fix text input color.  the screen that slides up could be wooden
//
//we need a button that appears when operations are pending and allows you to cancel and abort
//
//is there any way to stop the horizontal scrolling with clouds css?
//
//set cursor focus in the compare field when tab is clicked
//make hitting [enter] submit the form
//
//whole new rolloff functionality
//
//whole new ability to export your results into a textfield
//
//

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
        //check to see if its "ready" so it cant be activated more than one time
       if($('#btnCompare').hasClass('ready')){
            $('#btnCompare').removeClass('ready');
            myModules.compareBtnClickedUpdateDOM();
            myModules.validateMyList($('#user1Input').val(), $('#user2Input').val(), userName);
       }
    });
    $('#btnRemove').click(() => {
        //check to see if its "ready" so it cant be activated more than one time
       if($('#btnRemove').hasClass('ready')){
            $('#btnRemove').removeClass('ready');
            myModules.removeBtnClickedUpdateDOM();
            myModules.validateMySingleUser($('#removeGroupsInput').val(), userName);
       }
    });
});