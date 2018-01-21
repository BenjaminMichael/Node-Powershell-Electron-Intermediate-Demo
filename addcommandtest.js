const powershell = require('node-powershell');

console.log("begin");

let ps = new powershell({
    executionPolicy: 'Bypass',
    noProfile: true
}); 
ps.addCommand(`write-host 1`);
ps.invoke()
.then(output =>  {
    console.log("first");
    console.log(output);
})
.catch(err=>{
    ps.dispose();
});
/* remove the comments and this doesnt work you must make a new "new powershell"
ps.addCommand(`write-host 2`);
ps.invoke()
.then(output =>  {
    console.log(second);
    console.log(output);
})
.catch(err=>{
    ps.dispose();
});
*/