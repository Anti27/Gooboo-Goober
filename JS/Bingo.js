let tilts = [
    3, 2, 2, 2, 3,
    2, 3, 2, 3, 2,
    2, 2, 4, 2, 2,
    2, 3, 2, 3, 2,
    3, 2, 2, 2, 3
]

var storedDraws = [];
var groundDraws = [];
var nextDraws = [];
var automateBaseBoosts = false;
var baseBoostsArray = [];
var bingoCard = [];
var showDebug = false;
var stopNow = false;
var timer5;
var sinceLast;

function predictBingo() {
    var dict = JSON.parse(document.getElementById("saveData").innerHTML);
    if (dict.hasOwnProperty("event") ? dict.event.hasOwnProperty("casino_bingo_card") ? true : false : false) {
        let card = [];
        for (var x = 0, y = 0; (x < 5 && y < 5); x > 3 ? (x = 0, y++) : x++) {
            document.getElementById("grid" + String(x + y*5 + 1)).innerHTML = dict.event.casino_bingo_card[x][y].value;
            document.getElementById("grid" + String(x + y*5 + 1)).style.backgroundColor = "#d3c5fd38";
            card.push(dict.event.casino_bingo_card[x][y].value)
        }
        if (!automateBaseBoosts){
            bingoCard = structuredClone(card) 
        }
        let draws = [];
        if (dict.event.hasOwnProperty("casino_bingo_draws")) {
            if (storedDraws.length === 0){
                dict.event.casino_bingo_draws.forEach(i => {
                    draws.push(i);
                    groundDraws.push(i);
                    storedDraws.push(i);
                    card.includes(i) ? document.getElementById("grid" + (card.indexOf(i) + 1)).style.background = "green" : 0;
                });
            } else {
                storedDraws.forEach(i => {
                    draws.push(i);
                    card.includes(i) ? document.getElementById("grid" + (card.indexOf(i) + 1)).style.background = "green" : 0;
                });
            }
        }
        let boostI = 0.0;
        let boosts = [];
        if (automateBaseBoosts){
            var baseBoosts = [];
            baseBoostsArray.forEach(i => {baseBoosts.push(i)})
        } else {
            var baseBoosts = JSON.parse("[" + document.getElementById("bingoWeights").innerHTML + "]")
        }

        baseBoosts.forEach(i => {
            if (draws.includes(i)) { boosts.push(0) }
            else {
                boosts.push(i);
                card.includes(i) ? document.getElementById("grid" + (card.indexOf(i) + 1)).style.background = ["#FFA07A", "#FF7F50", "#FF6347"][Math.floor(boostI)] : 0;
            }
            boostI += 0.5;
        });

        let weights = buildArray(75).map(elem => {
            const num = elem + 1;
            if (draws.includes(num)) { return 0; }
            const boostIndex = boosts.findIndex(boost => boost === num);
            return boostIndex === -1 ? 1 : Math.floor(boostIndex / 2 + 3);
        });

        // Set draw goal based on drawn numbers
        let drawGoal = 12;
        if (draws.length >= 22) { drawGoal = 25; }
        else if (draws.length >= 17) { drawGoal = 22; }
        else if (draws.length >= 12) { drawGoal = 17; }

        let predictedDraws = [];
        let rngGen = new Math.seedrandom(document.getElementById('playerID').value + "bingo_draw_" + (parseInt(dict.rng.hasOwnProperty("bingo_draw") ? dict.rng.bingo_draw : 0)));
        while (draws.length < drawGoal) {
            const drawnNum = weightSelect(weights, rngGen());
            weights[drawnNum] = 0;
            draws.push(drawnNum + 1);
            predictedDraws.push(drawnNum + 1);
        }
        nextDraws = [];
        predictedDraws.forEach(i => { 
            card.includes(i) ? document.getElementById("grid" + (card.indexOf(i) + 1)).style.background = "greenyellow" : 0; 
            nextDraws.push(i);
        });
    }
}

function parseWeights() {
    var dict = JSON.parse(document.getElementById("saveData").innerHTML);
    let boosts = [];
    if (dict.event.hasOwnProperty("casino_bingo_boosts")) { dict.event.casino_bingo_boosts.forEach(i => { boosts.push(i); }); }
    document.getElementById("bingoWeights").innerHTML = boosts.join(", ")
}

function weightAdd(id) {
    var array = JSON.parse("[" + document.getElementById("bingoWeights").innerHTML + "]");
    array.includes(parseInt(document.getElementById(id).innerHTML)) ? array.splice(array.indexOf(parseInt(document.getElementById(id).innerHTML)), 1) : array.push(document.getElementById(id).innerHTML);
    document.getElementById("bingoWeights").innerHTML = array.join(", ")
    predictBingo();
}

function buildArray(length = 0) { return Array(length).fill().map((x, i) => i); }

document.getElementById("bingoSolve").onclick=async() => {
  await startSolver();
};



async function startSolver(){
    document.getElementById("bingoSolve").remove()
    let showResult = [0,0,0,0,0];
    automateBaseBoosts = true;
    baseBoostsArray = [];
    let internalDraw = structuredClone(groundDraws);
    let internalCard = structuredClone(bingoCard);
    let remaining = remainingCards(internalCard, internalDraw);
    let currentWeights = [];
    let internalDict = JSON.parse(document.getElementById("saveData").innerHTML);       
    let internalRngString = document.getElementById('playerID').value + "bingo_draw_";
    let internalDrawNumber = (parseInt(internalDict.rng.hasOwnProperty("bingo_draw") ? internalDict.rng.bingo_draw : 0));
    timer5 = new Date();
    
    await solver(showResult, currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber, 0)
    console.log("Combinations: " + showResult[2]);
    console.log("Max Find: " + showResult[0] + " Numbers: " + showResult[1] + " Enddraw: " + showResult[3]);
    console.log("Bingo: " + showResult[4] + " Weights: " + showResult[5] + " Draw: " + showResult[6]);
    document.getElementById("bingoFinish").innerText = "Tested all Combinations!";
}

async function solver(showResult, currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber, maxWeightsLenght){
    showResult[2] += 1
    let newInternalDraw = structuredClone(internalDraw);
    
    let predictedNextDraw = await efficientPredictBingo(currentWeights, newInternalDraw, internalRngString, internalDrawNumber)
    if (!newInternalDraw.some(card => predictedNextDraw.includes(card))){
        return;
    }
    internalDrawNumber++
    maxWeightsLenght += 2
    let drawsUntilNow = structuredClone(newInternalDraw)
    
    if (maxWeightsLenght >= 8){
        let currentResult = internalCard.filter(card => drawsUntilNow.includes(card));
        if (currentResult.length > showResult[0]){
            showResult[0] = currentResult.length;
            showResult[1] = structuredClone(currentWeights);
            showResult[3] = structuredClone(newInternalDraw);
        }
        let onlyImportantDraws = remainingCards(internalCard, newInternalDraw)
        let resultMap = structuredClone(internalCard)

        for (let z = 0; z < onlyImportantDraws.length; z++){
            let indexHit = resultMap.indexOf(onlyImportantDraws[z])
            if (indexHit !== -1)
            {resultMap[indexHit] = 0}
        }

        for (let z = 0; z < resultMap.length; z++){
            if (resultMap[z] !== 0)
            {
                resultMap[z] = 1
            }
        }

        let bingoCount = 0;
        
        for (let i = 0; i < 5; i++) {
            bingoCount += resultMap[i * 5] * resultMap[i * 5 + 1] * resultMap[i * 5 + 2] * resultMap[i * 5 + 3] * resultMap[i * 5 + 4]; // Horizontal
            bingoCount += resultMap[i] * resultMap[i + 5] * resultMap[i + 10] * resultMap[i + 15] * resultMap[i + 20]; // Vertical
        }
        
        bingoCount += resultMap[0] * resultMap[6] * resultMap[12] * resultMap[18] * resultMap[24]; // Diagonal
        bingoCount += resultMap[4] * resultMap[8] * resultMap[12] * resultMap[16] * resultMap[20]; // Anti-diagonal

        if (new Date() - timer5 > 1000){
            console.log("Combinations: " + showResult[2] + " Bingo: " + showResult[4] + " Weights: " + showResult[5] + " Draw: " + showResult[6] + " Last Sec: " + (showResult[2] - sinceLast))
            document.getElementById("bingoFinish").innerText = "Last Sec: " + (showResult[2] - sinceLast)
            await sleep(1);
            timer5 = new Date();
            sinceLast = showResult[2]
        }

        if (bingoCount > showResult[4]){
            showResult[4] = bingoCount;
            showResult[5] = structuredClone(currentWeights);
            showResult[6] = structuredClone(newInternalDraw);
            console.log("Combinations: " + showResult[2] + " Count: " + showResult[4] + " Weights: " + showResult[5] + " Draw: " + showResult[6]);
            document.getElementById("bingoCombinations").innerText = "Combinations: " + showResult[2];
            document.getElementById("bingoCount").innerText = "Count: " + showResult[4];
            document.getElementById("bingoWeights").innerText = "Weights: " + showResult[5];
            document.getElementById("bingoDraw").innerText = "Draw: " + showResult[6];
        }
        return;
    }
    let InternalRemainingCards = remainingCards(internalCard, drawsUntilNow)
    let possibleWeights = remainingCards(InternalRemainingCards, currentWeights)
    
    for (let p = 0; p <= maxWeightsLenght; p++){
        if (p > currentWeights.length){
            continue;
        }
        let difference = maxWeightsLenght - p;
        for (let x = 0; x <= difference; x++) {
            let processWeights = async (currentWeights, remainingWeights, depth) => {
                if (depth === x) {
                    await solver(showResult, currentWeights, internalCard, drawsUntilNow, internalRngString, internalDrawNumber, maxWeightsLenght);
                    return;
                }
        
                for (let i = 0; i < remainingWeights.length; i++) {
                    let nextWeights = structuredClone(currentWeights);
                    nextWeights.push(remainingWeights[i]);
        
                    let nextRemainingWeights = remainingCards(remainingWeights, [remainingWeights[i]]);
                    await processWeights(nextWeights, nextRemainingWeights, depth + 1);
                }
            };
            
            await processWeights(currentWeights, possibleWeights, 0);
        }
    }
}

async function efficientPredictBingo(currentWeights, internalDraw, internalRngString, internalDrawNumber) {
    let draws = internalDraw;
    let boostI = 0.0;
    let boosts = [];
    
    currentWeights.forEach(i => {
        if (draws.includes(i)) { 
            boosts.push(0) }
        else {
            boosts.push(i);
        }
        boostI += 0.5;
    });

    let weights = buildArray(75).map(elem => {
        const num = elem + 1;
        if (draws.includes(num)) { return 0; }
        const boostIndex = boosts.findIndex(boost => boost === num);
        return boostIndex === -1 ? 1 : Math.floor(boostIndex / 2 + 3);
    });

    // Set draw goal based on drawn numbers
    let drawGoal = 12;
    if (draws.length >= 22) { drawGoal = 25; }
    else if (draws.length >= 17) { drawGoal = 22; }
    else if (draws.length >= 12) { drawGoal = 17; }

    let predictedDraws = [];
    let rngGen = new Math.seedrandom(internalRngString + internalDrawNumber);

    while (draws.length < drawGoal) {
        const drawnNum = weightSelect(weights, rngGen());
        weights[drawnNum] = 0;
        draws.push(drawnNum + 1);
        predictedDraws.push(drawnNum + 1);
    }
    return predictedDraws;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function remainingCards(Card, Draw) {
    return Card.filter(card => !Draw.includes(card));
}
