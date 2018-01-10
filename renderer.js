//todo:
//change all the bind_i to regular i
//
//make it look better overall  -standard tab design.  make the purple footger look good on big monitors.  make an arow or something so its clear youre copying from user 1 to user2
//we need 2 button: start over & swap u1 u2
//
//is there any way to stop the horizontal scrolling with clouds css?
//
//set cursor focus in the compare field when tab is clicked
//make hitting [enter] submit the form
// left/right buttons toggle tabs
//
//easy animation: get-aduser success animation of some sort
//
//complete History tab
//
//



//renderer.js

var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];

const powershell = require('node-powershell');
window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js'); // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js'); // The sequence of ALL! of these requires is important
require('materialize-css');
const myModules = require('./my_modules/validate-userNames.js');

$(document).ready(() => {
    
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for Materialize's sass
    $('.tooltipped').tooltip({delay: 50}); //initialize tooltips
    $('#yourNameHere').html(userName); //update DOM with current users name
    
//user1Input and user2's are the 2 inputs
    $('#btnCompare').click(() => {
        //check to see if its "ready" so it cant be activated more than one time
       if($('#btnCompare').hasClass('ready')){
        $('#btnCompare').removeClass('ready');
            myModules.compareBtnClickedUpdateDOM();
            myModules.validateMyList($('#user1Input').val(), $('#user2Input').val(),userName);
       }
    });
});