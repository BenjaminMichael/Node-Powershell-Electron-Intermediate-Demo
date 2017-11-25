//render.js
//                                                                                              q
//see main./js for stuff that controls the window and beyond.  come here for everything that happens inside the window
//
//todo:
//validate input
//the initial animation is good but it doesnt take long enough we need more animations and/or a progress bar
//install PSDependencies
//function to add them to the group needs finishing and an animation
//custom error handler for ADGroupCompare.js both in the first promise and the rapidfirepromise
//adgroupcompare.js line 84 we need to give them an opportunity to switch the users
//intelligent hints about groups that end in -RDP and maybe other domain specific groups?  this would make another type of circle btn-large with the info icon that has a tooltip asbout how to add

const powershell = require('node-powershell')


window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js') // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js') // For the purpoises of this trick the sequence of these 3 requires is important
require('materialize-css')
require('./my_modules/validate-userNames.js')

$(document).ready(() => {
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for sass
    $('.tooltipped').tooltip({delay: 50})//initialize tooltips
    //determine the current logged in user and update the screen
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    ps.addCommand(`& whoami`)

    ps.invoke()
    .then(output => {
        $('#yourNameHere').html(output)
    })
    .catch(err => {
     ps.dispose()
    })
   
    //determine if the required PS Module is installed

    $('#btnCompare').click(() => {
        $('.mainForm').addClass("disabled")
        //needs a button to cancel
        $('#redMessageBar').empty();
            setTimeout(function(){
                $('#queryingSign').removeClass('hidden')
                $('#userinputarea').slideToggle("slow")
                $('#emptyRow').html(`<div class="row center">
                    <div class="progress">
                        <div class="indeterminate"></div>
                    </div>  
            </div>`)},500)
            validateMyList($('#user1Input').val(), $('#user2Input').val())
        })
    })