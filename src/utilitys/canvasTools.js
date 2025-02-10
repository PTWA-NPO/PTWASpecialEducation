export function center(object){
    return {x: object.x + object.width/2, y: object.y + object.height/2}
}

export function corner(object){
    if(object.radius) return {x: object.x - object.radius/2, y: object.y - object.radius/2}
    else return {x: object.x - object.width/2, y: object.y - object.height/2}
}

export function offset(object, {x:x, y:y}){
    return {x: object.x + x, y: object.y + y}
}

export function distance(object_1, object_2){
    return Math.pow(Math.pow(object_1.x-object_2.x,2)+Math.pow(object_1.y-object_2.y,2),0.5) 
}

export function shuffleOptions(array){
    let shuffled = [];
    for (let item in array) shuffled.push(array[item]);
    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    return shuffled;
}

export function isInBound(object, boundaries){
    //boundaries={up, down, left, right}
    if (
        object.y < boundaries.up ||
        object.y > boundaries.down ||
        object.x < boundaries.left ||
        object.x > boundaries.right
      )
        return false;
    else return true;
}

export function randomPosition(boundaries){
    return {
        x: Math.random()*(boundaries.right-boundaries.left)+boundaries.left,
        y: Math.random()*(boundaries.down-boundaries.up)+boundaries.up,
    }
}

export function randomPositionInCircle(center, radius){
    let boundaries = {
        up: center.y - radius,
        down: center.y + radius,
        left: center.x - radius,
        right: center.x + radius,
    }

    let isInCircle = false;
    let position;
    do{
        position = randomPosition(boundaries);
        if(distance(position, center) < radius) isInCircle = true;
    }while(!isInCircle);
    return position;
}

export function angle(object_1, object_2){
    if(object_2.x>object_1.x) return Math.atan((object_2.y-object_1.y)/(object_2.x-object_1.x))+Math.PI/2;
    else return Math.atan((object_2.y-object_1.y)/(object_2.x-object_1.x))+Math.PI/2*3;
}

export function slope(object_1,object_2){
    return((object_2.y-object_1.y)/(object_2.x-object_1.x));
}

export function unitVector(object_1, object_2){
    return {
        x: (object_2.x-object_1.x)/ distance(object_1, object_2),
        y: (object_2.y-object_1.y)/ distance(object_1, object_2),
    }
}