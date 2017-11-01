//validating the 2 uniqnames is critical to this application for 2 reasons:
//1.if there was a mistake this send you back to try again providing a better experience 
//2.forwarding the DN of the uniqnames gives you a faster get-ADGroup
//
// We will use this trick again when we get the AD-Groups and their DNs
// in get-adPrincipalGroups.ps1 then pass them along to get-effective-acceds.ps1
// to speed up doing get-adgroup a second time
//
const powershell = require('node-powershell')

require('./ADGroupCompare.js')

validateMyList = function (u1,u2){
    
    //do an animation
    let ps = new powershell({
        executionPolicy: 'Bypass',
        noProfile: true
    })

    ps.addCommand('./get-ADUser',[{u1:`"${u1}"`},{u2:`"${u2}"`}])

    ps.invoke()
    .then(output=>{
        
        const data=JSON.parse(output)
        console.log(data[0].DN+"..."+data[1].DN)
    if (data.Error) {
            $('.alert-danger .message').html(data.Error.Message)
            $('.alert-danger').show()
            return
        }else{
                listOfGroups(data[0].DN,data[1].DN,u1,u2)
                $('#user1').append(`<h4>${(data[0].UserName).toString()}</h4>`)
                $('#user2').append(`<h4>${(data[1].UserName).toString()}</h4><ul class="blue darken-1"><span class="amber-text text-lighten-1">`)
            }
        })
    
}