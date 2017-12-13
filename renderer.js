//todo:
//finish the add group membership
//history
//make it look better overall
//we need 2 button: reset / switch u1 u2
//figure out how to require node-powershell only once

//get the current user's userName
var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];
const powershell = require('node-powershell');
window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js'); // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js'); // For the purpoises of this trick the sequence of these 3 requires is important
require('materialize-css');
require('./my_modules/validate-userNames.js');

$(document).ready(() => {
    
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for Materialize's sass
    $('.tooltipped').tooltip({delay: 50}); //initialize tooltips
    $('#yourNameHere').html(userName); //update DOM with current users name
    
   
    $('#btnCompare').click(() => {
        $('.mainForm').addClass("disabled");
        //needs a button to cancel
        $('#redMessageBar').empty();
            setTimeout(function(){
                $('#queryingSign').removeClass('hidden');
                $('#userinputarea').slideToggle("slow");
                $('#emptyRow').html(`<div class="row center">
                    <div class="progress">
                        <div class="indeterminate"></div>
                    </div>  
            </div>`);},500);
            validateMyList($('#user1Input').val(), $('#user2Input').val());
        });
    });