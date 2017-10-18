const { Set } = require('immutable')

var user1 = Set(['GroupA', 'GroupB'])
var user2 = Set(['GroupA', 'GroupB','GroupC'])

var matchingGroups = (user1.intersect(user2)).toJSON()

var user1UniqGroups = user2.subtract(matchingGroups)
var user2UniqGroups = user1.subtract(matchingGroups)

var user1Output = '<ul><span class="red-text">'
user1UniqGroups.forEach(function (value){
    user1Output +='<li>' +  value + '</li>'
})
user1Output += '</span>'

var user2Output = '<ul><span class="red-text">'
user2UniqGroups.forEach(function (value){
    user2Output +='<li>' +  value + '</li>'
})
user2Output += '</span>'

user1Output += '<span class="green-text">'
user2Output += '<span class="green-text">'

matchingGroups.forEach(function (value){
    user1Output +='<li>' +  value + '</li>'
    user2Output +='<li>' +  value + '</li>'
})

user1Output += '</span>'
user2Output += '</span>'

user1Output +='</ul>'


console.log(user1Output)
console.log(user2Output)


/*
Goal1:
    Build a nice form for the data output
Goal2: to chain promises so it
    1)EASY Powershell fetch User1+User2's groups
    2)DONE Compare and build HTML lists of red (nonmatching) and green (matching)
    3)Manipulate the DOM
Goal 3:
FUN! make powershell script that output a JSON object containing 2 arrays (user 1 and 2) with an array of group names
*/