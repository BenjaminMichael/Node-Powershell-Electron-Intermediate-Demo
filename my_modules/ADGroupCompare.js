const { Set } = require('immutable');
const powershell = require('node-powershell');



listOfGroups = function(u1DN, u2DN, u1Name, u2Name){
        
            let ps = new powershell({
                executionPolicy: 'Bypass',
                noProfile: true
            });
        
            ps.addCommand(`./get-adPrincipalGroups.ps1 -user1 '${u1DN}' -user2 '${u2DN}'`);

            ps.invoke()
            .then(output => {
            const user1and2JSONfromPS = JSON.parse(output);
            const user1 = Set(user1and2JSONfromPS.user1sGroups);
            const user2 = Set(user1and2JSONfromPS.user2sGroups);
            const matchingGroups = (user1.intersect(user2));
            const user1UniqGroups = user1.subtract(matchingGroups);
            const user2UniqGroups = user2.subtract(matchingGroups);
            let letUser1Output = `<ul>`;
            let adGroupDNs=[];
            let i=0;
            user1UniqGroups.forEach((value)=>{
                let groupName = value.split(",");
                letUser1Output +=`
                    <li class="white blue-text row z-depth-2 valign-wrapper">
                        <div class="col s1 m1 l1">
                            <div class="${i==0?`led-yellow`:`led-blue`}" id="LED-${i}"></div>
                        </div>
                        <div class="col s11 m11 l11 blue-text text-darken-3 roboto">
                            ${groupName[0].slice(3)}
                            <div class="hidden center btn-floating btn-large waves-effect waves-light right green white-text lighten-1 z-depth-2" id="copyGroupBtn${i}">
                                <i class="close material-icons large">add</i>
                            </div>
                        </div>
                    </li>
                `;
                adGroupDNs[i]=value;
                i++;
            });
            
            let letUser2Output = `<ul class="listFont">`;
            user2UniqGroups.forEach(function (value){
                let groupName = value.split(",");
                letUser2Output += `<li class="z-depth-3 wood-color tooltipped" data-position="bottom" data-delay="50" data-tooltip="This is a group ${u1Name} is not in.">${groupName[0].slice(3)}</li>`;
            });

            matchingGroups.forEach(function (value){
                let groupName = value.split(",");
                letUser1Output += `<li class="brown z-depth-3 tooltipped darken-4" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${groupName[0].slice(3)}</li>`;
                letUser2Output += `<li class="brown z-depth-3 tooltipped darken-4" data-position="bottom" data-delay="50" data-tooltip="This is a group both users are already in.">${groupName[0].slice(3)}</li>`;
            });

            letUser1Output +='</ul>';
            letUser2Output +='</ul>';

            $('#user1').append(letUser1Output); //append HTML
            $('#user2').append(letUser2Output); // to the DOM
            $('#emptyRow').empty(); //remove the prelaunch progressbar
            $('#queryingSign').toggleClass('hidden');
            $('#useroutputarea').slideToggle("slow", "swing");
            
            $('.tooltipped').tooltip(); //dynamic tooltip init

            //this will be the upper limit for our literator i in a recursive function rapidfirepromise(i)
            const max=adGroupDNs.length;

            function rapidFirePromise(i){
                var  elementID=`#LED-${i}`; 
                $(elementID).addClass("led-yellow").removeClass("led-blue");

                let psChain = new powershell({
                executionPolicy: 'Bypass',
                noProfile: true
                });
            
                psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${adGroupDNs[i]}'`);

                psChain.invoke()
                .then(output => {
                    
                    if(!output.includes("FullControl")){
                    $(elementID).addClass("led-red").removeClass("led-yellow");
                }else{
                    $(elementID).addClass("led-green").removeClass("led-yellow");
                    $(`#copyGroupBtn${i}`).slideToggle("slow").click(function(){
                    //first it should warn you about adding u2Name to adGroupNames[i]
                        let psAsync = new powershell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                            });
                            
                            psAsync.addCommand(`./add-adGroupMember.ps1 -user '${u2Name}' -group '${adGroupDNs[i]}'`);
            
                            psAsync.invoke()
                            .then(output => {
                                if(output==="Success!"){
                                    $(`#copyGroupBtn${i}`).addClass('disabled').removeClass("green");
                                }else{
                                    $(`#copyGroupBtn${i}`).addClass("amber").removeClass("green");
                                    //more custom error handling
                                }
                            });
                        });
                    }
                        if (i<max-1){i++;return rapidFirePromise(i);}
                    })

//custom error handler
// Unable to find a default server with Active Directory Web Services running - means it couldnt contact AD check your connection to the network(offer a button to restart)
//
//Cannot find an object with identity: 'test' under: 'DC=adsroot,DC=itcs,DC=umich,DC=edu'. is an invalid user name. give them a reset button

            .catch(err => { 
                
                //in the case of an error in the promise, make the LED red with a tooltip of the error text
                $(elementID).html(`<div class="btn-large red white-text tooltipped" data-position="bottom" data-delay="50" data-tooltip="${err}">ERROR</div>`);

                ps.dispose();
                    });        
            } //end of rapidFirePromise
        
        rapidFirePromise(0);

        }); //end of the main then()

}; //end of function
