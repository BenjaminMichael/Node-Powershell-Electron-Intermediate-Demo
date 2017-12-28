/*
validating the 2 uniqnames means 2 things:
 1. if there was a mistake this send you back to try again providing a better experience 
 2. capturing the DN of the uniqnames gives you a faster get-ADGroup in the next step

@params: the 2 uniqnames u1 and u2
@param {String}userName: captured in Renderer.js
@returns: if all is valid we return {Function}listOfGroups which takes the distinguished and short names as parameters (see ADGroupCompare.js)
@side effects: lots of DOM manipulation in here

 PowerShell scripts:
 get-aduser to find the DNs for the users

*/
const powershell = require('node-powershell');

const myADGroupCompareModule = require('./ADGroupCompare.js');

module.exports.compareBtnClickedUpdateDOM = () => {
    $('.mainForm').addClass("disabled");
    $('#redMessageBar').empty();
    setTimeout(function(){
        $('#queryingSign').removeClass('hidden');
        $('#userinputarea').slideToggle("slow");
        $('#emptyRow').html(`<div class="row center">
                                <div class="progress">
                                    <div class="indeterminate"></div>
                                </div>  
                            </div>`);},500);
    };


module.exports.validateMyList = (u1,u2,userName) => {

    function _resetMyForm(){ //DOM manipulation for when the process is cancelled
        $('.mainForm').removeClass("disabled");
        $('#userinputarea').slideToggle("slow");
        $('#emptyRow').empty();
    }

    if (u1 =="" && u2==""){ //Cancel process in the case of any blank username
        setTimeout(function(){
            _resetMyForm();
            $('#redMessageBar').html(`You must enter 2 uniqnames`);
        },1000);  //if you dont wait for 1000 its too fast for the other animations
        return; //validateMyList is a function.  Here we Return to abruptly end the validation process due to as blank input field
    }

    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    });
    ps.addCommand('./get-ADUser',[{u1:`"${u1}"`},{u2:`"${u2}"`}]);
    ps.invoke()
    .then(output=>{
        const data=JSON.parse(output);
        if(data[3].Value.ModuleFound ===false){$('#redMessageBar').html(`This program cannot check your effectice permissions without PowerShell Access Control Module.  Please reinstall the program as administrator.  You can download it from the internet and unzip it to C:\\Program Files\\WindowsPowerShell\\Modules but you will still need local admin to do that.`);};
        if(data[2].Error.Message !== "No error"){
           _resetMyForm();
           $('#redMessageBar').html(data[2].Error.Message);
           return;
        }else{
                $('#user1').append(`<h4 class="wildwestfontStriped brown-text text-darken-3">${(data[0].UserName).toString()}</h4>`);
                $('#user2').append(`<h4 class="wildwestfontStriped brown-text text-darken-3">${(data[1].UserName).toString()}</h4><ul class="blue darken-1"><span class="amber-text text-lighten-1">`);
                return myADGroupCompareModule.listOfGroups(data[0].DN,data[1].DN,u1,u2,userName);
            }
        })
    .catch(err=>{
        ps.dispose();
        });    
};