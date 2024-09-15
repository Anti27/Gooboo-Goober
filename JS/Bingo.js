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

function remainingCards(Card, Draw) {
  return Card.filter(card => !Draw.includes(card));
}

function startSolver(){
    let showResult = [0,0,0];
    automateBaseBoosts = true;
    baseBoostsArray = [];
    let internalDraw = structuredClone(groundDraws);
    let internalCard = structuredClone(bingoCard);
    let remaining = remainingCards(internalCard, internalDraw);
    let currentWeights = [];
    let internalDict = JSON.parse(document.getElementById("saveData").innerHTML);       
    let internalRngString = document.getElementById('playerID').value + "bingo_draw_";
    let internalDrawNumber = (parseInt(internalDict.rng.hasOwnProperty("bingo_draw") ? internalDict.rng.bingo_draw : 0));
    
    solver(showResult, currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber, 0)
    console.log("Max Find: " + showResult[0]);
    console.log("Numbers: " + showResult[1]);
    console.log("Combinations: " + showResult[2]);
    console.log("Enddraw: " + showResult[3]);
}

function solver(showResult, currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber, maxWeightsLenght){
    showResult[2] += 1
    
    if (showResult[2] === 100){
        debugger;
    }
    
    if (showResult[2] === 1000){
        debugger;
    }
    
    if (showResult[2] === 10000){
        debugger;
    }
    
    if (showResult[2] === 100000){
        debugger;
    }
    
    if (showResult[2] === 1000000){
        debugger;
    }
    
    if (showResult[2] === 10000000){
        debugger;
    }
    
    let newInternalDraw = structuredClone(internalDraw);
    
    let predictedNextDraw = efficientPredictBingo(currentWeights, internalCard, newInternalDraw, internalRngString, internalDrawNumber)
    if (!newInternalDraw.some(card => predictedNextDraw.includes(card))){
        if (predictedNextDraw.length === 0){
            debugger;
        }
        return;
    }
    internalDrawNumber++
    maxWeightsLenght += 2
    let drawsUntilNow = structuredClone(newInternalDraw)

    if (showDebug){
        console.log(showResult, currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber, maxWeightsLenght);
    }

    if (maxWeightsLenght >= 6){
        let currentResult = internalCard.filter(card => drawsUntilNow.includes(card)).length;
        if (currentResult > showResult[0]){
            showResult[0] = currentResult;
            showResult[1] = structuredClone(currentWeights);
            showResult[3] = structuredClone(newInternalDraw);
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
        for (let x = 0; x <= difference; x++){
            switch(x) {
                case 0:
                    solver(showResult, currentWeights, internalCard, drawsUntilNow, internalRngString, internalDrawNumber, maxWeightsLenght)
                    break;
                case 1:
                    for (let i = 0; i < possibleWeights.length; i++){
                        let nextWeights = structuredClone(currentWeights)
                        nextWeights.push(possibleWeights[i])
                        solver(showResult, nextWeights, internalCard, drawsUntilNow, internalRngString, internalDrawNumber, maxWeightsLenght)
                    }
                    break;
                case 2:
                    for (let i = 0; i < possibleWeights.length; i++){
                        let nextWeights1 = structuredClone(currentWeights)
                        nextWeights1.push(possibleWeights[i])
                        let remainingPossibleWeights = remainingCards(possibleWeights, [possibleWeights[i]])                        
                        for (let j = 0; j < remainingPossibleWeights.length; j++){
                            let nextWeights2 = structuredClone(nextWeights1)
                            nextWeights2.push(remainingPossibleWeights[j])
                            solver(showResult, nextWeights2, internalCard, drawsUntilNow, internalRngString, internalDrawNumber, maxWeightsLenght)
                        }
                    }
                    break;
                case 3:
                    break;
                case 4:
                    break;
                case 5:
                    break;
                default:
                    
            } 
        }
        
    }
}

function efficientPredictBingo(currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber) {
    let card = internalCard;
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

