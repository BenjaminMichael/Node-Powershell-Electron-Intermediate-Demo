var lru = require('lru-cache')({max: 256, maxAge: 250/*ms*/});

var fs = require('fs');
var origLstat = fs.lstatSync.bind(fs);

// NB: The biggest offender of thrashing lstatSync is the node module system
// itself, which we can't get into via any sane means.
require('fs').lstatSync = function(p) {
  let r = lru.get(p);
  if (r) return r;

  r = origLstat(p);
  lru.set(p, r);
  return r;
};


window.$ = window.jQuery = require('./node_modules/jquery/dist/jquery.js'); // I use this when the NPM 'node_modules' folder is in my project and NOT installed globally.
window.Hammer = require('./node_modules/materialize-css/js/hammer.min.js'); // The sequence of these requires is important
require('materialize-css');
const myModules = require('./my_modules/myActions.js');
var path = require('path');
var userName = process.env['USERPROFILE'].split(path.sep)[2];


$(document).ready(() => {
    $('.carousel.carousel-slider').carousel({fullWidth: true});//initialize materialize carousel
    $('.carousel').click(() => $('.carousel').carousel('next'));
    $('.modal').modal(); //initialize Materialize modal
    $(".tabs>li>a").css("text-color", '#FFFFFF'); //a funky fix for Materialize's sass to make the tabs font color white
    $('.tooltipped').tooltip({delay: 50}); //initialize tooltips
    $('#yourNameHere').html(userName); //update DOM with current users name
    
    $('#user1Input, #user2Input').keydown(function(evt){
        if (!($('#user1Input').hasClass('notReady')) && evt.keyCode === 13) {
        $('input').addClass('notReady');
        myModules.beginCompare(userName);
        }
    });
    $('#removeuserinputarea').keydown(function(evt){
        if (!($('#removeuserinputarea').hasClass('notReady')) && evt.keyCode === 13) {
            $('#removeuserinputarea').addClass('notReady');
        myModules.beginRemove(userName);
        }
    });

    $('#btnCompare').click(() => {
        $(this).addClass('disabled');
        myModules.beginCompare(userName);
    });
    $('#btnRemove').click(() => {
        $(this).addClass('disabled');
        myModules.beginRemove(userName);
    });
});