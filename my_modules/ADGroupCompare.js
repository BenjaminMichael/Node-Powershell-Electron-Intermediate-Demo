const { Set } = require('immutable')
const powershell = require('node-powershell')

module.exports.listOfGroups = class listOfGroups{
        constructor(u1, u2){
            let ps = new powershell({
                executionPolicy: 'Bypass',
                noProfile: true
            })
        
            ps.addCommand("./get-adPrincipalGroups.ps1", [{user1:u1},{user2:u2}])
        
            ps.invoke()
            .then(output => {
            const user1and2JSONfromPS = JSON.parse(output)
            const user1 = Set(user1and2JSONfromPS.user1sADGroupNames)
            const user2 = Set(user1and2JSONfromPS.user2sADGroupNames)
            const matchingGroups = (user1.intersect(user2))
            const user1UniqGroups = user1.subtract(matchingGroups)
            const user2UniqGroups = user2.subtract(matchingGroups)
            let adGroupNames=[]
            let letUser1Output = `<h2>${user1and2JSONfromPS.user1Name}</h2>
            <table>
                <tbody>`
            let i=0
            user1UniqGroups.forEach((value)=>{
                letUser1Output +=`
                <tr>
                    <td class="white blue-text">
                        <div class="col valign-wrapper">
                            <div class="${i==0?`led-yellow`:`led-blue`} left" id="LED-${i}"></div>
                        </div>
                        <div class="row blue-text text-darken-3">${value} &nbsp;<div class="hidden chip right green white-text lighten-1 z-depth-2" id="copyGroupBtn${i}"><i class="close material-icons large">add</i>Add ${user1and2JSONfromPS.user1Name}</div></div>
                    </td>
                </tr>`  
                adGroupNames.push(value)
                i++
            })
            letUser1Output += '</tbody></table><ul>'

            let letUser2Output = `<h2>${user1and2JSONfromPS.user2Name}</h2><ul class="blue darken-1"><span class="amber-text text-lighten-1">`
            user2UniqGroups.forEach(function (value){
                letUser2Output += `<li class="z-depth-3 tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group ${user1and2JSONfromPS.user1Name} is not in.">${value}</li>`
            })
            letUser2Output += '</span>'

            matchingGroups.forEach(function (value){
                letUser1Output +=  `<li class="blue z-depth-3 tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${value}</li>`
                letUser2Output += `<li class="blue z-depth-3 tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${value}</li>`
            })

            letUser1Output +='</ul>'
            letUser2Output +='</ul>'

            $('#user1').append(letUser1Output) //DOM
            $('#user2').append(letUser2Output) //DOM
            $('.tooltipped').tooltip() //Materialize component dynamic init

            const max=adGroupNames.length
            
            function rapidFirePromise(i){
                var  elementID=`#LED-${i}` 
                $(elementID).addClass("led-yellow")
                $(elementID).removeClass("led-blue")

                let ps = new powershell({
                executionPolicy: 'Bypass',
                noProfile: true
                })
                
                ps.addCommand("./get-effective-access.ps1", [{adgroupname : adGroupNames[i]}])

                ps.invoke()
                .then(output => {
                    
                    if(!output.includes("FullControl")){
                    //make LED red
                    $(elementID).addClass("led-red")
                    $(elementID).removeClass("led-yellow")
                }else{
                    //make LED green
                    $(elementID).addClass("led-green")
                    $(elementID).removeClass("led-yellow")
                    const copyGroupBtnElement = `#copyGroupBtn${i}`
                    $(copyGroupBtnElement).slideToggle("slow")
                    //assign the click handler
                    $(copyGroupBtnElement).click(function(){
                            alert("call my function")
                        })
                    }
                        if (i<max-1){i++;rapidFirePromise(i)}
                    }) //end of recursive then()
            .catch(err => { 
                console.error(err)
                //make LED red with a tooltip of the error text
                $(elementID).html(`<a class="btn-large red white-text  tooltipped" data-position="bottom" data-delay="50" data-tooltip="${err}">ERROR</a>`)

                ps.dispose()
                    })        
            } //end of rapidFirePromise
        
        rapidFirePromise(0)

        }) //end of the main then()
    } //end of constructor   
} //end of class export
