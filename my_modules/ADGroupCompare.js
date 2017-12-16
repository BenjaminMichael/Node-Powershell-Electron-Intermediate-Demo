const { Set } = require('immutable');
const powershell = require('node-powershell');

/*
FUNCTION: listOfGroups
 @param {String} u1DN distinguished name of "user 1"
 @param {String} u2DN distinguished name of "user 2"
 @param {String} u1Name hort name of "user 1"
 @param {String} u2Name are the same AD User Object's short names
 @param {String} currentUserName is UserName from Render.js

 Updates the DOM with a list of both matching and nonmatching group memberships.
 Then it checks User 1's nonmatching groups to see if the current user has permission to add
 anyone to the group and it updates the DOM accordingly.

PowerShell scripts:
get-adPrincipalGroups to build 2 lists of group memberships to compare
get-effective-access to see if you can add user 2 to any of user 1's groups
add-adgroupmember to add user 2 to user 1's groups 1 at a time

*/
listOfGroups = function(u1DN, u2DN, u1Name, u2Name, userName){
        
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
            
                psChain.addCommand(`./get-effective-access.ps1 -adgroupdn '${adGroupDNs[i]}' -me ${userName} -i ${i}`);
                psChain.invoke()
                .then(output => {
                const data = JSON.parse(output);                
                    if(!data[0].Result.includes("FullControl")){
                    $(elementID).addClass("led-red").removeClass("led-yellow");
                }else{
                    $(elementID).addClass("led-green").removeClass("led-yellow");
                    $(`#copyGroupBtn${data[1].bind_i}`).slideToggle("slow").click(function(){
                        //really this should disable immediately so you cant spam it
                        //needs a cool progress animation
                        let psAsync = new powershell({
                            executionPolicy: 'Bypass',
                            noProfile: true
                            });
                            
                            psAsync.addCommand(`./add-adGroupMember.ps1 -user '${u2Name}' -group '${adGroupDNs[data[1].bind_i]}' -i ${data[1].bind_i}`);
            
                            psAsync.invoke()
                            .then(output => {
                                const data = JSON.parse(output);
                                if(data[0].Result==="Success"){
                                    console.log('debug1');
                                    $(`#copyGroupBtn${data[0].bind_i}`).addClass('disabled').removeClass("green");
                                }else{
                                    $(`#copyGroupBtn${data[0].bind_i}`).addClass("amber").removeClass("green");
                                    $('#redMessageBar').html(data[1]);
                                }
                            });
                        });
                    }
                        if (i<max-1){i++;return rapidFirePromise(i);}
                    })
            .catch(err => { 
                
                //in the case of an error in the promise, make the LED red with a tooltip of the error text
                $(elementID).html(`<div class="btn-large red white-text tooltipped" data-position="bottom" data-delay="50" data-tooltip="${err}">ERROR</div>`);

                ps.dispose();
                    });        
            } //end of rapidFirePromise
        
        rapidFirePromise(0);

        }); //end of the main then()

}; //end of function
