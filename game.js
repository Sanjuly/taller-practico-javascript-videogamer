//variables para trabajar con canvas
const canvas = document.querySelector('#game');
const game = canvas.getContext('2d'); //bidimensional
//variables para manipular el DOM
const btnUp = document.querySelector('#up');
const btnLeft = document.querySelector('#left');
const btnRight = document.querySelector('#right');
const btnDown = document.querySelector('#down');
const spanLives = document.querySelector('#lives');
const spanTime = document.querySelector('#time');
const spanRecord = document.querySelector('#record');
const pResult = document.querySelector('#result');
//const num = document.querySelector('#num');

//variables que vamos a usar dentro de las funciones
let canvasSize; //tamaño del canvas
let elementsSize; // tamaño del elemento
let level = 0; //primera posición del array niveles
let lives = 3; // vidas que tiene el jugador

let timeStart; //tiempo para empezar
let timePlayer; //tiempo de juego
let timeInterval; //

//variable const se puede modificar su valor porque es un objeto y estamos modificando sus propiedades
const playerPosition = {
    x: undefined,
    y: undefined,
}
const giftPosition = {
    x: undefined,
    y: undefined,
}
let enemyPositions = []; //posicion del enemigo

window.addEventListener('load', setCanvasSize); //escuchando el window para cargar el tamaño del canvas
window.addEventListener('resize', setCanvasSize); //para recargar

//para controlar los decimales
function fixNumber(n) {
    return Number(n.toFixed(2));
}

//tamaño del canvass
function setCanvasSize() {
    if (window.innerHeight > window.innerWidth) {
        canvasSize = window.innerWidth * 0.75;
    } else {
        canvasSize = window.innerHeight * 0.75;
    }
canvasSize = Number(canvasSize.toFixed(0));
canvas.setAttribute('width', canvasSize);
canvas.setAttribute('height', canvasSize);

elementsSize = fixNumber(canvasSize / 10);
playerPosition.x = undefined;
playerPosition.y = undefined;
startGame();
}

//juego
function startGame() { //renderizsa los elementos del canvas
    game.font = elementsSize + 'px Verdana';
    game.textAlign = 'end';
//para renderizar los otros emoijs partiendo de los arreglos
const map = maps[level];
if (!map) {
    gameWin();
    return;
}
if (!timeStart) {
    timeStart = Date.now();
    timeInterval = setInterval(showTime,100);
    showRecord();
}
//el string los limpiamos de espacios vacios con la funcion trim(), luego creamos un arreglo con salto de linea con el split que nos va a dar las filas
const mapRows = map.trim().split('\n');
//apartir del array de filas aplicando el metodo map puedo obtener cada string y aplicarle trim y split para que me den los arreglos con cada fila
const mapCols = mapRows.map(row => row.trim().split(''));//array bidimencional
//console.log({map, mapRows, mapCols});
showLives(); //funcion que genera las vidas
enemyPositions = []; //posicion de los enemigos
game.clearRect(0,0, canvasSize,canvasSize);
//render de cada uno de los elementos
mapCols.forEach((row, rowI) => {
    row.forEach((col, colI) => {
    const emoji = emojis[col];//obteniendo la letra
    const posX = elementsSize * (colI + 1); //columnas coordenas
    const posY = elementsSize * (rowI + 1); //filas
    
    if (col == 'O') {
        if (!playerPosition.x && !playerPosition.y) {
            playerPosition.x = posX;
            playerPosition.y = posY;
            console.log(playerPosition);
        }
    } else if (col == 'I') {
            giftPosition.x = posX;
            giftPosition.y = posY;
    } else if (col == 'X') {
            enemyPositions.push({
            x: posX,
            y: posY,
        });
    }
    game.fillText(emoji, posX, posY); //para dibujar en el canvas
    //console.log({row, rowI, col, colI})   
    });    
});//renderizando el jugador
    movePlayer();
}

function movePlayer() {
    //toFixed(3)para que llegue a tres decimales
    //hay un solo regalo
    const giftCollisionX = playerPosition.x.toFixed(3) == giftPosition.x.toFixed(3);
    const giftCollisionY = playerPosition.y.toFixed(3) == giftPosition.y.toFixed(3);
    const giftCollision = giftCollisionX && giftCollisionY;//si ambas condiciones coinciden es true detecta la colision
    
    if (giftCollision) {
        //funcion para cambiar de nivel
        levelWin();
    }
    const enemyCollision = enemyPositions.find(enemy => {
        const enemyCollisionX = enemy.x.toFixed(3) == playerPosition.x.toFixed(3);
        const enemyCollisionY = enemy.y.toFixed(3) == playerPosition.y.toFixed(3);
        return enemyCollisionX && enemyCollisionY;
    });
    if (enemyCollision) {
        levelFail();
    }
    game.fillText(emojis['PLAYER'], playerPosition.x.toFixed(3), playerPosition.y.toFixed(3));
}   //cuando ganas
    function levelWin() {
        console.log('Subiste de Nivel');
        level++;
        startGame();
    }
    //cuando pierde
    function levelFail() {
        console.log('Chocaste contra un enemigo');
        lives--;
        //console.log(lives);
        if (lives <= 0) {
            level = 0;
            lives = 3;
            timeStart = undefined;
        }
        playerPosition.x = undefined;
        playerPosition.y = undefined;
        startGame();
    }

    function gameWin() {
        console.log('¡Terminaste el juego!');
        clearInterval(timeInterval);

        const recordTime = localStorage.getItem('record_time');
        const playerTime = Date.now() - timeStart;
        
        if (recordTime) {   
            if (recordTime >= playerTime) {
            localStorage.setItem('record_time', playerTime);
            pResult.innerHTML = 'SUPERASTE EL RECORD :)';
            } else {
            pResult.innerHTML = 'lo siento, no superaste el records :(';
            }
        } else {
            localStorage.setItem('record_time', playerTime);
            pResult.innerHTML = 'Primera vez? Muy bien, pero ahora trata de superar tu tiempo :)';
        }
            console.log({recordTime, playerTime});
}
    function showLives() {
        const heartsArray = Array(lives).fill(emojis['HEART']);
        //console.log(heartsArray);
        spanLives.innerHTML = "";
        heartsArray.forEach(heart => spanLives.append(heart));
    }
    function showTime() {
        spanTime.innerHTML = Date.now() - timeStart;
    }
    function showRecord() {
        spanRecord.innerHTML= localStorage.getItem('record_time');
    }

//EVENTOS CLICK Y KEYDOWN
//para saber hacia donde se quiere mover el jugador
document.addEventListener('keydown', moveByKeys);
btnUp.addEventListener('click', moveUp);
btnLeft.addEventListener('click', moveLeft);
btnRight.addEventListener('click', moveRight);
btnDown.addEventListener('click', moveDown);
//num.addEventListener('click', numbers);


function moveByKeys(event) {
    if (event.key == 'ArrowUp') moveUp();
    else if (event.key == 'ArrowLeft') moveLeft();
    else if (event.key == 'ArrowRight') moveRight();
    else if (event.key == 'ArrowDown') moveDown();
    //else if (event.key == '0') numbers();
}
function moveUp() {
    console.log('Me quiero mover hacia arriba');
    if ((playerPosition.y - elementsSize) < elementsSize) {
        console.log('OUT');
    } else {
        playerPosition.y -= elementsSize;
        startGame();
    }
}
function moveLeft() {
    console.log('Me quiero mover hacia izquierda');
    if ((playerPosition.x - elementsSize) < elementsSize) {
    console.log('OUT');
    } else {
    playerPosition.x -= elementsSize;
    startGame();
    }
}
function moveRight() {
    console.log('Me quiero mover hacia derecha');
    if ((playerPosition.x + elementsSize) > canvasSize) {
    console.log('OUT');
    } else {
    playerPosition.x += elementsSize;
    startGame();
    }
}
function moveDown() {
    console.log('Me quiero mover hacia abajo');
    
    if ((playerPosition.y + elementsSize) > canvasSize) {
    console.log('OUT');
    } else {
    playerPosition.y += elementsSize;
    startGame();
    }
}



//function numbers() {
  //  console.log('Soy un cero');
//}
    //for (let row = 1; row < 10; row++) {
    //    for (let col = 1; col < 10; col++) {
    //        game.fillText(emojis[mapCols[row -1][col -1]], elementsSize * col, elementsSize * row); 
    //    }
    //}



  //window.innerHeight
  // window.innerWidth

  // game.fillRect(0,50,100,100);
  // game.clearRect(50,50,50,50);
  // game.clearRect()
  // game.clearRect(0,0,50,50);

  // game.font = '25px Verdana'
  // game.fillStyle = 'purple';
  // game.textAlign = 'center';
  // game.fillText('Platzi', 25, 25);