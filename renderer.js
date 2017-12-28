//todo:
//finish the add group membership - made it update DOM and have the option of undo
//add the ability to undo afer you finish that group member add
//
//make it look better overall  -standard tab design.  make the purple footger look good on big monitors
//we need 2 button: reset / switch u1 u2
//
//incorporate robocopy tab instead of history

//get the current user's userName
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
    
   
    $('#btnCompare').click(() => {
        myModules.compareBtnClickedUpdateDOM();
        myModules.validateMyList($('#user1Input').val(), $('#user2Input').val(),userName);
        });
    });