//todo:
//
//make it look better overall  -standard tab design.
//SASS? fix text input color.
//
//need a flip users button for compasre
//set cursor focus in the compare field when tab is clicked?
//make hitting [enter] submit the form!! <--!
//make welcome tab more informative

//renderer.js

const powershell = require('node-powershell');
window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js'); // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js'); // The sequence of these requires is important
require('materialize-css');
const myModules = require('./my_modules/myActions.js');
var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];


$(document).ready(() => {
    $('.modal').modal(); //initialize Materialize modal
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for Materialize's sass to make the tabs font color white
    $('.tooltipped').tooltip({delay: 50}); //initialize tooltips
    $('#yourNameHere').html(userName); //update DOM with current users name
    
    $('#user1Input, #user2Input').keydown(function(evt){
        if (!($('#user1Input').hasClass('notReady')) && evt.keyCode === 13) {
        $('input').addClass('notReady');
        myModules.beginCompare(userName);
        }
    });
    $('#btnCompare').click(() => {
        $(this).addClass('disabled');
        myModules.beginCompare(userName);
    });
    $('#btnRemove').click(() => {
        $(this).addClass('disabled');
        myModules.beginRemove(userName);
    });
});