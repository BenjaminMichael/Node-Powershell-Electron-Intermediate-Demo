//render.js
//
//see main./js for stuff that controls the window and beyond.  come here for everything that happens inside the window
//
        // The initial action of Creating a list of AD permissions groups is the only significant user interaction
        // when they click a button initiating a sequence where the end of the sequence is a chain of async calls.
        //
        // First, the user will click a button that calls an event handler function
        // retreiving a list of groups from Powershell via Node-Powershell's
        // invoke-then Promise methods.
        //
        // inside the .then() of the invoke-then pattern I create a new "listOfGroups" ES 6class object 
        // to make HTML out of the JSON from Powershell into for rending in Electron.  This happens very
        // fast with immutable.js data structure SET's .itersect and .subtract
        //
        // inside the .then() after I create my new list the DOM is refreshed with the <ul>
        // and I call a function which creates an array of all the <li> on the DOM.  I iterate through
        // this array "slowly" by using a named function "rapidFirePromise" containing another
        // Node-Powershell invoke-then Promise pattern.
        //
        // rapidFirePromise follows a recursive pattern:
        // i call it once to kick off a Promise and then I iterate and call it again inside the .then() of that Promise
        // so I never have more than 1 Promise rapid-firing and the rapid-fire begins inside the .then()
        // of the original promise.  You could call it a Promise to Rapid Fire pattern.
        //
        //note: this is a bit overkill and there are faster ways to lazy load node-powershell console sessions
//There needs to be helper HTML that draws your attention
//to the fact that We are copying This GUYS's permissions to THAT GUY
window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js') // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js') // For the purpoises of this trick the sequence of these 3 requires is important
require('materialize-css')
const { listOfGroups } = require('./my_modules/ADGroupCompare.js')

//everything below here is horrific




$(document).ready(() => {
    $('#btnCompare').click(() => {
        $('.tooltipped').tooltip({delay: 50})//initialize tooltips
        $('.mainForm').addClass("disabled")
        //validateMyInput($('#user1Input').val(), $('#user2Input').val())
        setTimeout(function(){$('#userinputarea').slideToggle("slow")},500)
        $('#emptyrow').html(`<div class="row center"><div class="btn">test</div></div>`)


        const myHTML = new listOfGroups($('#user1Input').val(), $('#user2Input').val())
    })
})
