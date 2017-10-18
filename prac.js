const { Set } = require('immutable')
function differenceOf2Arrays(array1,array2)
{
    const set1 = Set(array1)
    const set2 = Set(array2)
    const matchingElements = set1.intersect(set2)
    const set1uniqueElements = set1.subtract(matchingElements)
    const set2uniqueElements = set2.subtract(matchingElements)
    var result = []

    set1uniqueElements.forEach((element)=>{
    result.push(element)
    })
    set2uniqueElements.forEach((element)=>{
        result.push(element)
        })
    return result
}
console.log(differenceOf2Arrays([1, 2, 3], [100, 2, 1, 10]));
console.log(differenceOf2Arrays([1, 2, 3, 4, 5], [1, [2], [3, [[4]]],[5,6]]));