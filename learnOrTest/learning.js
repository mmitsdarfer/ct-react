const array = [2, [[], []], 9];

console.log(array);

for(let i = 0; i < array.length; i++){
  if(array[i] !== undefined){
    if(array[i].length > 0){
      for(let j = 0; j < array[i].length; j++){
        while(array[i][j] !== undefined){
            if(array[i][j].length == 0){
                array[i].splice(j, 1);
            }
          }
      }
    }
    if(array[i].length == 0){
      array.splice(i, 1);
    }
  }
}

console.log(array[1].length);

const index = array.indexOf([]);
if (index > -1) { // only splice array when item is found
  // 2nd parameter means remove one item only
}

// array = [2, 9]
console.log(array); 