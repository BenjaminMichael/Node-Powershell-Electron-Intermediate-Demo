//todo:
//install PSDependencies
//history
//custom error handlers
//adgroupcompare.js line 84 we need to give them an opportunity to switch the users

const powershell = require('node-powershell');


window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js'); // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js'); // For the purpoises of this trick the sequence of these 3 requires is important
require('materialize-css');
require('./my_modules/validate-userNames.js');

$(document).ready(() => {
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for sass
    $('.tooltipped').tooltip({delay: 50});//initialize tooltips
    
    //determine the current logged in user and update the screen
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    });

    ps.addCommand(`& whoami`);

    ps.invoke()
    .then(output => {
        $('#yourNameHere').html(output);
        let psx = new powershell({
            executionPolicy: 'Bypass',
            noProfile: true
        });
       psx.addCommand(`test-path "C:\\Program Files\\WindowsPowerShell\\Modules\\PowerShellAccessControl"`);
       psx.invoke()
       .then(output =>{
           if ((output.indexOf('True')) !== -1){
               $('.disabled').removeClass('disabled');
               $('#moduleInstallPrompt').html('click on Compare to begin.');
            }else{
                //link to modal from this button
                $('#moduleInstallPrompt').hide('fast');
                $('#PSModInstallText').show('fast');
                $('#clickHerePSModuleInstall').click(() => {
                    let ps2 = new powershell({
                        executionPolicy: 'Bypass',
                        noProfile: true
                    });
                    ps2.addCommand('./Copy-Item.ps1');
                    ps2.invoke()
                    .then(output =>{
                        console.log(output);
                    })
                    .catch(err=>{
                    //do nothing
                    });
                });
               }
            })
       .catch(err=>{
           //do nothing
       });
       
       
    })
    .catch(err => {
     ps.dispose();
    });
   
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