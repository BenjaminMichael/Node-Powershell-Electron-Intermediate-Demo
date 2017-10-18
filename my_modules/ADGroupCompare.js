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
            var adGroupNames=[]
            let letUser1Output = `<h2>${user1and2JSONfromPS.user1Name}</h2>
            <ul class="blue darken-2">
                <span class="white-text">`
            let i=0
            user1UniqGroups.forEach((value)=>{
            
                const myElementID = `${i}`
                
                letUser1Output +=`
                <li class="ADli row z-depth-3 white blue-text">
                    <div class="col valign-wrapper">
                        <div class="${i==0?`led-yellow`:`led-blue`} left" id="LED-${myElementID}"></div>
                    </div>
                    <div class="col blue-text text-darken-4 overflowClip">${value}</div>
                </li>`  
                adGroupNames.push(value)
                i++
            })

            letUser1Output += '</span>'

            let letUser2Output = `<h2>${user1and2JSONfromPS.user2Name}</h2><ul class="blue darken-1"><span class="red amber-text ">`
            user2UniqGroups.forEach(function (value){
                letUser2Output += `<li class="z-depth-3">${value}</li>`
            })
            letUser2Output += '</span>'

            letUser1Output += '<span>'
            letUser2Output += '<span>'

            matchingGroups.forEach(function (value){
                letUser1Output += `<li class="blue z-depth-3>${value}</li>`
            })

            matchingGroups.forEach(function (value){
                letUser2Output += `<li class="blue z-depth-3>${value}</li>`
            })

            letUser1Output += '</span>'
            letUser2Output += '</span>'

            letUser1Output +='</ul>'
            letUser2Output +='</ul>'


            $('#user1').append(letUser1Output) //DOM Render
            $('#user2').append(letUser2Output) //DOM Render

        
        function canIModifyThis(listOfIDs){ 
            
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
                        }
                        if (i<max-1){i++;rapidFirePromise(i)}
                    }) //end of recursive then()
            .catch(err => { 
                console.error(err)
                //make LED red
                $(elementID).html(`<a class="btn-large red white-text">ERROR</a>`)

                ps.dispose()
                    })        
            } //end of rapidFirePromise
        
        rapidFirePromise(0)

            } //end of canIModifyThis()
            canIModifyThis() //singleton recursive function
        }) //end of the main then()
    } //end of constructor   
} //end of class export
