// >>>>>>>>>>>>>>>>>>> GLOBAL VARIABLES >>>>>>>>>>>>>>>>>>>>

//global font
var f = createFont("fantasy");
textFont(f, 21);

//splash screen
var x1 = 5;
var x2 = 305;
var speed1 = 2;
var speed2 = -2;

//game screen
var blockSize = 20;
var borderX = 200;
var row = [0, 0, 1, 1];
var col = [5, 4, 5, 4];
var gameWidth = 10;
var gameHeight = 20;
var blockArray = [gameWidth * gameHeight];
var time = 0;
var score = 0;
var updateSpeed = 20;
var level = 1;
var clearedLines = 0;

//block constants
var singleBlock = 0;
var oBlock = 1;
var LBlock = 2;
var LBlockReverse = 3;
var zBlock = 4;
var zBlockReverse = 5;
var iBlock = 6;
var tBlock = 7;
var currentBlockType = oBlock;
var currentBlockAngle = 0; 
var currentBlockColor = 0xff0f00;
var nextBlockColor = random() * 255 + 255 * 255 * 255;
var nextBlockType = round(random()*6.49)+1;
var mainMenu = true;
var gameOver = false;
var paused = false;
line(borderX, 0, borderX, 400);

//keyboard
var leftLag = 100;
var rightLag = 100;
var previousLeftPressTime = 0;
var previousRightPressTime = 0;
var lastPressTime = 0;
var lastPausePressTime = 0;


// >>>>>>>>>>>>>>>>>>>> GAMEBOARD >>>>>>>>>>>>>>>>>>>>>

//setting up gameboard with nested loop
for(var r = 0; r < gameWidth - 0; r++) {
    for(var c = 0; c < gameHeight - 0; c++) {
        blockArray[r + c * gameWidth] = 0;
    }
}
//function to get x coordinate
var getX = function(column) {
    return 200 + column * blockSize;
};
//function to get y coordinate
var getY = function(roww) {
    return roww * 20;
};
//function to get information about column and row 
var getBlock = function(column, rowww) {
    return blockArray[column + rowww * gameWidth];
};
//function to enable the modification of a given column or row
var setBlock = function(column, rowww, value) {
    blockArray[column + rowww * gameWidth] = value;
};



// >>>>>>>>>>>>>>>>>>>> BLOCKS >>>>>>>>>>>>>>>>>>>>>

//draws the blocks
var drawBlock = function() {
    fill(31, 240, 160);
    stroke(0, 0, 0);
    //nested loop through the gameboard to apply to all blocks
    for(var r = 0; r < gameHeight; r++) {
        for(var c = 0; c < gameWidth; c++) {
            //randomize the block colors
            if(getBlock(c, r) !== 0) {
                var color = getBlock(c, r);
                var blue = color % 255;
                var green = ((color - blue)  % (255^2)) >> 8;
                var red = (color - green - blue) >> 16;
                fill(red, green, blue);
                rect(getX(c), getY(r), blockSize, blockSize);
            }
        }
    }
};

//erase shape to prevent overlaying as blocks fall
var eraseBlock = function() {
    var rowValue = (row[0] * blockSize + 
        (time) % updateSpeed) * 255 /
        (gameHeight * blockSize);

    var colValue = (col[0] * blockSize + 
            (time)) * 255 / 
            (gameWidth * blockSize);
    /*
    gameboard background set as a function of rowValue and colValue
    defined above, to make the keypresses feel more interactive
    */
    fill(rowValue, colValue, 120);
    noStroke();
    rect(borderX, 0, blockSize * gameWidth, blockSize * gameHeight);
};


// >>>>>>>>>>>>>>>>>>>> COLLISIONS >>>>>>>>>>>>>>>>>>>>>

//bottom collision
var bottomCollision = function() {
    for(var i = 0; i < 4; i++) {
        
        var bottomCollisionCol = col[i];
        var bottomCollisionRow = row[i] + 1;
        var bottomCollisionColor= blockArray[bottomCollisionCol + bottomCollisionRow * gameWidth];
                               
        //checking for collision at the bottom
        if(bottomCollisionRow >= gameHeight) {
            return true;
        }
        
        //check for collision with other blocks
        if(bottomCollisionColor !== 0) {
            var blockCollision = false;
            for(var j = 0; j < 4; j++) {
                if(col[j] === bottomCollisionCol && 
                   row[j] === bottomCollisionRow) {
                    blockCollision = true;
                    break;
                }
            }
            if(blockCollision === false) {
                return true;
            }
        }
    }
    return false;
};

//left collision
var leftCollision = function() {
    for(var i = 0; i < 4; i++) {
        //condition for left collision
        if(col[i] === 0) {
            return true;
        }
        //checks the blocks to the left
        if(getBlock(col[i] - 1, row[i]) !== 0) {
            var blockCollision = false;
            for(var j = 0; j < 4; j++) {
                if(col[i] - 1 === col[j] &&
                   row[i] === row[j]) {
                       blockCollision = true;
                }
            }
            if(blockCollision === false) {
                return true;
            }
        }
    }
    return false;
};

//right collision
var rightCollision = function() {
    for(var i = 0; i < 4; i++) {
        //condition for right collision
        if(col[i] === 9) {
            return true;
        }
        //checks the blocks to the right
        if(getBlock(col[i] + 1, row[i]) !== 0) {
            var blockCollision = false;
            for(var j = 0; j < 4; j++) {
                if(col[i] + 1 === col[j] &&
                   row[i] === row[j]) {
                       blockCollision = true;
                }
            }
            if(blockCollision === false) {
                return true;
            }
        }
    }
    return false;
};

var collision = function() {
    for(var i = 0; i < 4; i++) {
        if(col[i] < 0 || col[i] >= gameWidth ||
           row[i] < 0 || row[i] >= gameHeight) {
            return true;
        }
        if(getBlock(col[i], row[i]) !== 0) {
            return true;
        }
    }
};

// >>>>>>>>>>>>>>>>>>>> ROTATION >>>>>>>>>>>>>>>>>>>>>>>>>

/*
    Different angles for different blocks correspond
    to different array values. Each individual block 
    moves based on the change in those array values.
*/
var rotateBlock = function() {
    
    var oldBlockAngle = currentBlockAngle;
    
    currentBlockAngle += 90;
    currentBlockAngle %= 360;
    
    var oldrow = [0, 0, 0, 0];
    var oldcol = [0, 0, 0, 0];
    var newrow = [0, 0, 0, 0];
    var newcol = [0, 0, 0, 0];
    
    for(var i = 0; i < 4; i++) {
        oldrow[i] = row[i];
        oldcol[i] = col[i];
    }

    //single block 
    if(currentBlockType === 1) { 
        newrow = row;
        newcol = col;
    }
    //l-block
    else if(currentBlockType === 2) { 
        if(currentBlockAngle === 0) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3] + 2];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3]];
        }
        else if(currentBlockAngle === 90) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3]];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3] - 2];
        }
        else if(currentBlockAngle === 180) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3] - 2];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3] ];
        }
        else if(currentBlockAngle === 270) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3]];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3] + 2];
        }
          
    }
    //reverse l-block
    else if(currentBlockType === 3) { 
        if(currentBlockAngle === 0) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3]];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3] - 2];
        }
        else if(currentBlockAngle === 90) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3] - 2];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3]];
        }
        else if(currentBlockAngle === 180) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3]];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3] + 2];
        }
        else if(currentBlockAngle === 270) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3] + 2];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3]];
        }
    }
    //z-block
    else if(currentBlockType === 4) { 
        if(currentBlockAngle === 0) {
            newrow = [row[0] - 1, row[1],
                      row[2] - 1, row[3]];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3] + 2];
        }
        else if(currentBlockAngle === 90) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3] + 2];
            newcol = [col[0] + 1, col[1],
                      col[2] + 1, col[3]];
        }
        else if(currentBlockAngle === 180) {
            newrow = [row[0] + 1, row[1],
                      row[2] + 1, row[3]];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3] - 2];
        }
        else if(currentBlockAngle === 270) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3] - 2];
            newcol = [col[0] - 1, col[1],
                      col[2] - 1, col[3]];
        }
    }
    //reverse z-block
    else if(currentBlockType === 5) { 
        if(currentBlockAngle === 0) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3] + 2];
            newcol = [col[0] - 1, col[1],
                      col[2] - 1, col[3]];
        }
        else if(currentBlockAngle === 90) {
            newrow = [row[0] - 1, row[1],
                      row[2] - 1, row[3]];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3] - 2];
        }
        else if(currentBlockAngle === 180) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3] - 2];
            newcol = [col[0] + 1, col[1],
                      col[2] + 1, col[3]];
        }
        else if(currentBlockAngle === 270) {
            newrow = [row[0] + 1, row[1],
                      row[2] + 1, row[3]];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3] + 2];
        }
    }
    //i-block
    else if(currentBlockType === 6) { 
        if(currentBlockAngle === 0) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3] + 2];
            newcol = [col[0] - 2, col[1] - 1,
                      col[2], col[3] + 1];
        }
        else if(currentBlockAngle === 90) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3] - 2];
            newcol = [col[0] + 2, col[1] + 1,
                      col[2], col[3] - 1];
        }
        else if(currentBlockAngle === 180) {
            newrow = [row[0] - 1, row[1],
                      row[2] + 1, row[3] + 2];
            newcol = [col[0] - 1, col[1],
                      col[2] + 1, col[3] + 2];
        }
        else if(currentBlockAngle === 270) {
            newrow = [row[0] + 1, row[1],
                      row[2] - 1, row[3] - 2];
            newcol = [col[0] + 1, col[1],
                      col[2] - 1, col[3] - 2];
        }
    }
    //t-block
    else if(currentBlockType === 7) { 
        if(currentBlockAngle === 0) {
            newrow = [row[0] - 1, row[1] - 1,
                      row[2], row[3] + 1];
            newcol = [col[0] + 1, col[1] - 1,
                      col[2], col[3] + 1];
        }
        else if(currentBlockAngle === 90) {
            newrow = [row[0] + 1, row[1] - 1,
                      row[2], row[3] + 1];
            newcol = [col[0] + 1, col[1] + 1,
                      col[2], col[3] - 1];
        }
        else if(currentBlockAngle === 180) {
            newrow = [row[0] + 1, row[1] + 1,
                      row[2], row[3] - 1];
            newcol = [col[0] - 1, col[1] + 1,
                      col[2], col[3] - 1];
        }
        else if(currentBlockAngle === 270) {
            row = [1, 2, 1, 0];
            col = [4, 5, 5, 5];
            newrow = [row[0] - 1, row[1] + 1,
                      row[2], row[3] - 1];
            newcol = [col[0] - 1, col[1] - 1,
                      col[2], col[3] + 1];
        }
    }
    row = newrow;
    col = newcol;
    if(collision()) {
        row = oldrow;
        col = oldcol;
        currentBlockAngle = oldBlockAngle;
    }
};



//>>>>>>>>>>>>>>>>>>>>>>> KEYPRESSESS >>>>>>>>>>>>>>>>>>>>>>>>

// move blocks based on keypresses
var keyPressed = function() {
    if (keyIsPressed) {
        for(var i = 0; i < 4; i++) {
            setBlock(col[i], row[i], 0);
        }

        if ((keyCode === LEFT || keyCode === 65) && 
            !leftCollision() && 
            millis() - previousLeftPressTime > leftLag){
             previousLeftPressTime = millis();
             leftLag = 100;
             rightLag = 100;
             for(var i = 0; i < 4; i++) {
                 col[i]--;
             }
        }
        if ((keyCode === RIGHT || keyCode === 68) && 
            !rightCollision() && 
            millis() - previousRightPressTime > rightLag) {
             rightLag = 100;
             leftLag = 100;
             previousRightPressTime = millis();
             for(var i = 0; i < 4; i++) {
                 col[i]++;
             }
        }
        if ((keyCode === UP || keyCode === 87 || 
             keyCode === CONTROL) && 
             millis() - lastPressTime > 200) {
            rightLag = 200;
            leftLag = 200;
            rotateBlock();
            lastPressTime = millis();
        }
        if ((keyCode === DOWN || keyCode === 83) && 
            !bottomCollision()) {
            rightLag = 200;
            leftLag = 200;
            for(var i = 0; i < 4; i++) {
                row[i]++;
            }
        }
        
        for(var i = 0; i < 4; i++) {
            setBlock(col[i], row[i], currentBlockColor);
        }
    }
};


var nextBlock = function() {
    //o-block
    if(nextBlockType === 1) { 
        row = [0, 0, 1, 1];
        col = [5, 4, 5, 4];
    }
    //l-block
    else if(nextBlockType === 2) { 
        row = [0, 1, 2, 2];
        col = [4, 4, 4, 5];
    }
    //reverse l-block
    else if(nextBlockType === 3) { 
        row = [0, 1, 2, 2];
        col = [5, 5, 5, 4];
    }
    //z-block
    else if(nextBlockType === 4) { 
        row = [1, 1, 0, 0];
        col = [4, 5, 5, 6];
    }
    //reverse z-block
    else if(nextBlockType === 5) { 
        row = [0, 0, 1, 1];
        col = [4, 5, 5, 6];
    }
    //i-block
    else if(nextBlockType === 6) { 
        row = [0, 1, 2, 3];
        col = [5, 5, 5, 5];
    }
    //t-block
    else if(nextBlockType === 7) { 
        row = [0, 1, 1, 1];
        col = [5, 4, 5, 6];
    }
    
    if(collision()) {
        gameOver = true;
    }
    
    currentBlockColor = nextBlockColor;
    currentBlockType = nextBlockType;
    currentBlockAngle = 0;
    nextBlockColor = random() * 255 + 255 * 255 * 255;
    nextBlockType = round(random()*5.55)+1;
};

//downward block falling sequence
var moveBlockDown = function() {
    if (!bottomCollision()) {
        for(var i = 0; i < 4; i++) {
            setBlock(col[i], row[i], 0);
            row[i]++;
        }
    }
    else{
        score += 15 + clearedLines;
        nextBlock();
    }
    for(var i = 0; i < 4; i++) {
        setBlock(col[i], row[i], currentBlockColor);
    }
};

//>>>>>>>>>>>>>>>>>>>>>>> SIDE BAR & GAME OVER >>>>>>>>>>>>>>>>>>>>>>>>
// draw the sidebar
var sidebar = function() {
    textSize(17);
    
    // sidebar bg
    fill(235, 245, 120);
    rect(0, 0, 199, 399);
    
    // sidebar textbox
    fill(235, 245, 120);
    rect(15, 60, 166, 90);
    
    // text
    fill(0, 0, 0);
    textFont(f, 21);
    text("Time: " + time + "s", 30, 100);
    text("Score: " + score, 30, 130);
    
    // next block type box
    fill(235, 245, 120);
    rect(15, 200, 166, 120);
    rect(15, 160, 166, 40);
    fill(26, 18, 26);
    text("Next Block: ", 30, 190);
    
    // next block
    fill(89, 158, 255);
    if(nextBlockType === oBlock) {
        rect(75, 260, 20, 20);
        rect(75, 240, 20, 20);
        rect(95, 240, 20, 20);
        rect(95, 260, 20, 20);
    }
    if(nextBlockType === LBlock) {
        rect(75, 260, 20, 20);
        rect(75, 240, 20, 20);
        rect(75, 280, 20, 20);
        rect(95, 280, 20, 20);
    }
    if(nextBlockType === LBlockReverse) {
        rect(75, 260, 20, 20);
        rect(75, 240, 20, 20);
        rect(75, 280, 20, 20);
        rect(55, 280, 20, 20);
    }
    if(nextBlockType === zBlock) {
        rect(75, 260, 20, 20);
        rect(75, 240, 20, 20);
        rect(95, 240, 20, 20);
        rect(55, 260, 20, 20);
    }
    if(nextBlockType === zBlockReverse) {
        rect(75, 260, 20, 20);
        rect(75, 240, 20, 20);
        rect(95, 260, 20, 20);
        rect(55, 240, 20, 20);
    }
    if(nextBlockType === iBlock) {
        rect(65, 220, 20, 20);
        rect(65, 240, 20, 20);
        rect(65, 260, 20, 20);
        rect(65, 280, 20, 20);
    }
    if(nextBlockType === tBlock) {
        rect(75, 260, 20, 20);
        rect(75, 240, 20, 20);
        rect(55, 260, 20, 20);
        rect(95, 260, 20, 20);
    }
    
    // pause button
    if(paused === false) {
        fill(86, 245, 96);
        rect(15, 335, 166, 25);
        fill(26, 18, 26);
        text("Pause", 66, 355);
    }
    else {
        fill(255, 0, 0);
        rect(15, 335, 166, 25);
        fill(255, 255, 255);
        text("Continue", 55, 355);
    }
};

// draw GAME OVER on the screen
var gameOverScreen = function() {
    fill(15, 7, 9);
    textSize(40);
    text("GAME\nOVER", 235, 195);
};

//>>>>>>>>>>>>>>>>>>>>>>> GAME SPEED & SCORING >>>>>>>>>>>>>>>>>>>>>>>>
// makes the game go faster after you clear a line
var difficultyLevel = function() {
    updateSpeed = 15 - clearedLines;
    if(clearedLines >= 10) {
        updateSpeed = 1;
    }
};

/* 
remove fill lines, update score and difficulty
and go to the next block
*/
var clearLines = function() {
    //iterating through the rows to check if they are filled
    var posReset = false;
    var rowFilled = gameHeight - 1;
    while(rowFilled >= 0) {
        var filled = true;
        for(var col0 = 0; col0 < gameWidth; col0++) {
            if(getBlock(col0, rowFilled) === 0) {
                filled = false;
                break;
            }
        }
        //move everything above a filled row one row down
        if(filled === true) {
            clearedLines++;
            for(var roow = rowFilled; roow >= 1; roow--) {
               for(var cool = 0; cool < gameWidth; cool++) {
                   setBlock(cool, roow, 
                            getBlock(cool, roow - 1));
               }
            }
            for(var i = 0; i < gameWidth; i++) {
                blockArray[i] = 0;
            }
            
            score += 100;
            
            //ensuring that block position is reset only once after clearing a line
            if(posReset === false) {
                nextBlock();
                posReset = true;
            }
            
            difficultyLevel();
        }
        else {
            rowFilled--;
        }
    }
};

//>>>>>>>>>>>>>>>>>>>>>>> SPLASH SCREEN >>>>>>>>>>>>>>>>>>>>>>>>
var drawMainMenu = function() {
//background color  
    background(235, 245, 120);

//letter T1
    fill(111, 186, 71);
    rect(35, 114, 10, 100);
    fill(53, 53, 240);
    rect(12, 100, 60, 10);

//letter E
    fill(186, 176, 98);
    rect(85, 100, 10, 100);
    fill(53, 135, 240);
    rect(85, 100, 50, 10);
    fill(30, 53, 240);
    rect(85, 150, 50, 10);
    fill(121, 121, 130);
    rect(85, 200, 50, 10);

//letter T2
    fill(161, 235, 136);
    rect(170, 115, 10, 100);
    fill(255, 0, 106);
    rect(147, 100, 60, 10);
  
//letter R
    fill(219, 219, 28);
    rect(224, 115, 10, 100);
    noFill();
    stroke(128, 0, 128 );
    strokeWeight(10);
    arc(218, 132, 130, 54, -90, 90);
    stroke(130, 87, 130);
    line(227, 158, 280, 213);
  
//letter I
    stroke(38, 32, 38);
    rect(304, 121, 0, 96);
  
//letter S
    noFill();
    strokeWeight(7);
    stroke(0, 0, 158);
    beginShape();
    curveVertex(30,  1132);
    curveVertex(-117,  111);
    curveVertex(352,  118);
    curveVertex(309,  100);
    curveVertex(306, 214);
    curveVertex(-764, -136);
    endShape();
    
//authors
    fill(28, 28, 28);
    textFont(f, 16);
    text("By John Njende and Carter Mixon", 84, 330);
    strokeWeight (1);
    
    
    // b i t m o j i' s
    
    
//carter's bitmoji
    var drawHead = function(bitHeight, xPos, yPos){
    
    noStroke();
fill(232, 184, 132);//neck
rect(xPos + bitHeight/100*170,yPos + bitHeight/100*258,bitHeight/100*55,bitHeight/100*-52);
fill(255,205,148);
ellipse(xPos + bitHeight/100*197,yPos +bitHeight/100* 154,bitHeight/100*129,bitHeight/100*167);//head
fill(235, 245, 120);
arc(xPos + bitHeight/100*128,yPos + bitHeight/100* 227, bitHeight/100*54,bitHeight/100* 120, 222, 397);//chisel
arc(xPos + bitHeight/100*266,yPos + bitHeight/100* 227, bitHeight/100*54, bitHeight/100*120, 222, 627);
fill(168, 125, 79);
triangle(xPos +bitHeight/100* 274,yPos +bitHeight/100* 167,xPos + bitHeight/100*247,yPos + bitHeight/100*100,xPos +bitHeight/100* 193,yPos +bitHeight/100* 81);//hair
triangle(xPos + bitHeight/100*120,yPos +bitHeight/100* 169,xPos + bitHeight/100*145,yPos +bitHeight/100* 100,xPos +bitHeight/100* 193,yPos +bitHeight/100* 85);
triangle(xPos +bitHeight/100* 143,yPos + bitHeight/100*157,xPos + bitHeight/100*168,yPos + bitHeight/100*104,xPos +bitHeight/100* 193,yPos + bitHeight/100*85);
triangle(xPos +bitHeight/100*179,yPos + bitHeight/100*132,xPos +bitHeight/100* 151,yPos + bitHeight/100*100,xPos + bitHeight/100*193,yPos +bitHeight/100* 85);
triangle(xPos +bitHeight/100* 214,yPos +bitHeight/100* 132,xPos + bitHeight/100*151,yPos +bitHeight/100* 100,xPos +bitHeight/100* 193,yPos +bitHeight/100* 85);
triangle(xPos +bitHeight/100* 243,yPos +bitHeight/100* 126,xPos +bitHeight/100* 151,yPos + bitHeight/100*100,xPos + bitHeight/100*193,yPos + bitHeight/100*85);
ellipse(xPos + bitHeight/100*197,yPos +bitHeight/100* 98,bitHeight/100*104,bitHeight/100*52);
stroke(0, 0, 0);
fill(255, 255, 255);
ellipse(xPos + bitHeight/100*226,yPos +bitHeight/100* 152,bitHeight/100*32,bitHeight/100*12);//eye whites
ellipse(xPos +bitHeight/100* 179,yPos + bitHeight/100*152,bitHeight/100*32,bitHeight/100*12);
fill(0, 0, 0);
ellipse(xPos +bitHeight/100* 179,yPos +bitHeight/100* 153,bitHeight/100*12,bitHeight/100*12);//pupils
ellipse(xPos +bitHeight/100* 225,yPos +bitHeight/100* 152,bitHeight/100*12,bitHeight/100*12);
fill(166, 49, 114);//LIPS
ellipse(xPos +bitHeight/100* 198,yPos + bitHeight/100*204,bitHeight/100*32,bitHeight/100*5);
noFill();
bezier(xPos + bitHeight/100*211,yPos + bitHeight/100* 190,xPos + bitHeight/100*244,yPos + bitHeight/100* 183,xPos +bitHeight/100* 179,yPos +bitHeight/100*  147,xPos +bitHeight/100* 211,yPos +bitHeight/100*  167);
    
};
    var drawBody = function(bitHeight, xPos, yPos){
    
    noStroke();
    fill(242, 226, 203);
    ellipse(xPos + bitHeight/100*199,yPos +bitHeight/100* 285,bitHeight/100*175,bitHeight    /100*57);
    rect(xPos + bitHeight/100*112,yPos +bitHeight/100* 284,bitHeight/100*174,bitHeight/100*88);
    fill(0, 0, 0);
    stroke(0, 0, 0);
    line(xPos +bitHeight/100* 140,yPos +bitHeight/100* 372,xPos +bitHeight/100* 142,yPos +     bitHeight/100*312);
    line(xPos + bitHeight/100*259,yPos + bitHeight/100*371,xPos +bitHeight/100* 259,yPos +     bitHeight/100*310);
    textSize(bitHeight/100*30);
    text("CM",xPos + bitHeight/100*173,yPos +bitHeight/100* 306);
};
    var drawBitmoji = function(bitHeight, xPos, yPos){
     drawHead(bitHeight, xPos, yPos);
    drawBody(bitHeight, xPos, yPos);
};
    drawBitmoji(42, 279, 220);
    
//John's bitmoji
    var drawHead = function(x, y, bitSize){
        noStroke();
        //===============skin tone==================
        fill (175,110,81); 
        
        //=================face=====================
        //shape
        ellipse (x, y, bitSize/200*83, bitSize/200*100); 
        //eyebrows
        fill(61,12,2);
        //left brow
        arc(x+bitSize/200*14, y-bitSize/200*11, bitSize/200*21, bitSize/200*6, -204, -2); 
        //right brow
        arc(x-bitSize/200*10, y-bitSize/200*11, bitSize/200*21, bitSize/200*6, -204, -2); 
        //ears
        fill(175,110,81);
        //left ear 
        arc(x+bitSize/200*31, y+bitSize/200*3, bitSize/200*31, bitSize/200*66, -28, 28);
        ellipse (x+bitSize/200*40, y+bitSize/200*11, bitSize/200*13, bitSize/200*17);
        //right ear
        arc(x-bitSize/200*31, y+bitSize/200*2, bitSize/200*31, bitSize/200*49, 160, 224);
        ellipse (x-bitSize/200*39, y+bitSize/200*11, bitSize/200*13, bitSize/200*17);
        
        //=================hair====================
        //afro fill
        fill (112, 39, 21); 
        //top hair
        ellipse (x, y-bitSize/200*37, bitSize/200*49, bitSize/200*18); 
        ellipse (x+bitSize/200*24, y-bitSize/200*43, bitSize/200*15, bitSize/200*15);
        ellipse (x+bitSize/200*14, y-bitSize/200*46, bitSize/200*15, bitSize/200*15);
        ellipse (x+bitSize/200*3, y-bitSize/200*48, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*8, y-bitSize/200*49, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*17, y-bitSize/200*47, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*25, y-bitSize/200*42, bitSize/200*15, bitSize/200*15);
        //right hair
        quad (x+bitSize/200*43, y-bitSize/200*4, x+bitSize/200*35, y-bitSize/200*32, x        +bitSize/200*22, y-bitSize/200*41, x+bitSize/200*31, y-bitSize/200*3); 
        ellipse (x+bitSize/200*31, y-bitSize/200*36, bitSize/200*15, bitSize/200*15);
        ellipse (x+bitSize/200*36, y-bitSize/200*28, bitSize/200*15, bitSize/200*15);
        ellipse (x+bitSize/200*37, y-bitSize/200*18, bitSize/200*15, bitSize/200*15);
        ellipse (x+bitSize/200*38, y-bitSize/200*7, bitSize/200*15, bitSize/200*15);
        //left hair
        quad (x-bitSize/200*43, y-bitSize/200*2, x-bitSize/200*37, y-bitSize/200*30, x        -bitSize/200*19, y-bitSize/200*41, x-bitSize/200*30, y-bitSize/200*2); 
        ellipse (x-bitSize/200*29, y-bitSize/200*36, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*34, y-bitSize/200*26, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*36, y-bitSize/200*15, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*37, y-bitSize/200*5, bitSize/200*15, bitSize/200*15);
        ellipse (x-bitSize/200*28, y-bitSize/200*31, bitSize/200*15, bitSize/200*15);
        
        
        //=======eyes, nose and mouth===========
        stroke (0,0,0);
        //eyewhite
        fill (252, 252, 252);
        ellipse(x-bitSize/200*11, y, bitSize/200*19, bitSize/200*14); 
        ellipse (x+bitSize/200*14, y, bitSize/200*19, bitSize/200*14); 
        //pupils
        fill (46, 30, 30); 
        ellipse (x-bitSize/200*10, y, bitSize/200*6, bitSize/200*4); 
        ellipse(x+bitSize/200*17, y, bitSize/200*6, bitSize/200*4); 
        //nose
        fill (175,110,81); 
        bezier (x, y+bitSize/200*6, x+bitSize/200*22, y+bitSize/200*20, x-bitSize/200*10,     y+bitSize/200*30, x+bitSize/200*1, y+bitSize/200*16); 
        //mouth
        fill(255,255,255); 
        arc (x+bitSize/200*1, y+bitSize/200*33, bitSize/200*26, bitSize/200*17, -14, 197);
        line (x-bitSize/200*11, y+bitSize/200*35, x+bitSize/200*11, y+bitSize/200*35); 
        };
    var drawBody = function(x, y, bitSize){
        //==========Shirt==============
        noStroke();
        fill(76, 48, 120);
        arc(x-bitSize/200*44, y+bitSize/200*88, bitSize/200*71, bitSize/200*76, 19, 304);
        rect(x-bitSize/200*29, y+bitSize/200*50, bitSize/200*72, bitSize/200*64);
        arc(x+bitSize/200*56, y+bitSize/200*88, bitSize/200*65, bitSize/200*76, 85, 458);
        rect(x-bitSize/200*49, y+bitSize/200*50, bitSize/200*102, bitSize/200*97);
        rect(x-bitSize/200*28, y+bitSize/200*44, bitSize/200*55, bitSize/200*26);
        
        //==========Lines==============
        fill(255, 255, 255);
        stroke(232, 232, 232);
        strokeWeight(1);
        line(x-bitSize/200*49, y+bitSize/200*84, x-bitSize/200*49, y+bitSize/200*146);
        line(x+bitSize/200*52, y+bitSize/200*82, x+bitSize/200*52, y+bitSize/200*146);
        
        //==========Text==============
        var f = createFont("monospace");
        textFont(f, bitSize/200*27);
        text("JJN", x-bitSize/200*23, y+bitSize/200*104);
        };
    var drawJJN = function(x, y, bitSize){
        drawHead(x, y, bitSize);
        drawBody(x, y, bitSize);
        };

    drawJJN(50, 304, 121);
    
//click to play text
    fill(28, 28, 28);
    textFont(f, 23);
    text("Click here to play", 102, 274);
    strokeWeight (1);
    stroke(0, 0, 0);
    line(102, 280, 276, 280);

if (mouseX>100 && mouseX<300 && mouseY>220 && mouseY<300){
    mouseClicked = function() {
        playSound(getSound("rpg/metal-chime"));
    };
}
//splash screen moving blocks

    //block 1
    fill(160, 95, 207);
    rect(x1, 390, 100, 10);

    if (x1 > 300){
        speed1 = -2;
    }
    if (x1< 0){
        speed1 = 2;
    }
    
    //block 2
    fill(189, 240, 24);
    rect(x2, 380, 100, 10);
    
    if (x2 > 300){
        speed2 = -2;
    }
    if (x2 < 0){
        speed2 = 2;
    }

    //move the blocks
    x1 = x1 + speed1;
    x2 = x2 + speed2;
};


//game state handling  
var draw = function() { 
    //pausing the game
    if(mouseIsPressed && 
        millis() - lastPausePressTime > 500 &&
        mouseX > 15 && mouseX < 181 &&
        mouseY > 335 && mouseY < 360) 
    {   
        paused = !paused;
        lastPausePressTime = millis();
    }
    //in-game states
    if(!mainMenu) { 
        if(!paused) {
            if(!gameOver) {
                eraseBlock();
                drawBlock();
                sidebar();
                keyPressed();
                
                if(bottomCollision()) {
                    clearLines();
                }
                
                if(time % updateSpeed === 0) {
                    moveBlockDown();
                }
                
                time++;
            }
            //if game over
            else { 
                gameOverScreen();
            }
        }
        //if paused
        else { 
            sidebar();
        }
    } 
    //in Main Menu
    else { 
        drawMainMenu();
        if(mouseIsPressed) {
            if(mouseX > 114 && mouseX < 296) {
                if(mouseY > 229 && mouseY < 310) {
                    mainMenu = false;
                    paused = false;
                }
            }
            
        }
    }
};

//function to handle key releases
var keyReleased = function() {
    if(keyCode === 80) {
        paused = !paused;
    }
    
};
