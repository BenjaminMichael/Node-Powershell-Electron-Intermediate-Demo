const Queue = require('better-queue');
const powershell = require('node-powershell');

const ps = new powershell({executionPolicy: 'Bypass', noProfile: true});

const PSQueue= new Queue(function (input, cb) {
    ps.addCommand(`./get-effective-access.ps1 -adgroupdn '${input.groupDN}' -me 'm-mhibdon2' -i ${input.i} -workflow 'Remove'`);
    ps.invoke()
    ps.then(output =>{
    cb(null, null);
    });
}, {afterProcessDelay: 100, maxTimeout: 25000, batchSize: 1});

const respondToPSOutput = (data) => {
    switch(data[0].Result){
        case "Get-ADUser Remove Error":
            
        break;
        case "Get-ADUser Compare Error":
           
        break;
        case "Get-ADUser Compare":
            
        break;
        case "Get-ADUser Remove":
        let payload=data[0];
        ps.addCommand(`./get-adPrincipalGroups.ps1 -user1 '${payload.DN}' -cu '${payload.CurrentUser}' -user1FName ${payload.FName} -user1LName ${payload.LName}`);
        ps.invoke();
        break;
        case "Get-ADPrincipalGroupMembership Remove":
        let grouplist=data[0].user1sGroups;
        grouplist.forEach((val, index) => {
            PSQueue.push({i:index, groupDN: val});
        });
        break;
        case "Get-ADPrincipalGroupMembership Compare":

        break;
        case "Get-EffectiveAccess Remove":
        console.log(data);
        break;
        }
};
ps.on('output', output =>{
    let data;
    try{
        data = JSON.parse(output);
        respondToPSOutput(data);
    }
    catch(err){
        console.log('EOI error');
        let outputChunks = output.split(`EOI`);
        outputChunks.forEach(chunk => {
            ps.addCommand(`write-host ${chunk}`);
            ps.invoke();
        });
    } 
    
});

ps.addCommand(`./get-ADUser -u1 'mhibdon' -cu 'm-mhibdon2'`);
ps.invoke();