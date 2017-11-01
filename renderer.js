//render.js
//
//see main./js for stuff that controls the window and beyond.  come here for everything that happens inside the window
//
//todo:
//validate input
//install PSDependencies
//function to add them to the group needs finishing and an animation
//custom error handler for ADGroupCompare.js both in the first promise and the rapidfirepromise
//add a safe way to exit the program?


window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js') // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js') // For the purpoises of this trick the sequence of these 3 requires is important
require('materialize-css')
require('./my_modules/validate-userNames.js')

$(document).ready(() => {
    $('.tooltipped').tooltip({delay: 50})//initialize tooltips

    $('#btnCompare').click(() => {
        $('.mainForm').addClass("disabled")
        setTimeout(function(){$('#userinputarea').slideToggle("slow")
        $('#emptyRow').html(`<div class="row center">
            <div class="progress">
                <div class="indeterminate"></div>
            </div>  
        </div>`)},500)
        validateMyList($('#user1Input').val(), $('#user2Input').val())
        
        })
        
    })