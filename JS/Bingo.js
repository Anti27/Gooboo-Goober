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
var drawNumber = 0
var rngString = "";

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
        
        var rngString = document.getElementById('playerID').value + "bingo_draw_";
        var drawNumber = (parseInt(dict.rng.hasOwnProperty("bingo_draw") ? dict.rng.bingo_draw : 0))
        
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
    let maxBingo = 0;
    let showResult = [];
    automateBaseBoosts = true;
    baseBoostsArray = [];
    let internalDraw = structuredClone(groundDraws) 
    let internalCard = structuredClone(bingoCard) 
    let remaining = remainingCards(internalCard, internalDraw);
    let allPairs = [];
    let internalRngString = rngString;
    let internalDrawNumber = drawNumber;
    
    for (let i = 0; i < remaining.length; i++) {
        for (let j = 0; j < remaining.length; j++) {
            if (i < j){
                continue;
            }
            if (i == j){
                allPairs.push([remaining[i]])
            }else{
                allPairs.push([remaining[i],remaining[j]])
            }
        }
    }
    for (let p = 0; p < allPairs.length; p++){
        solver(maxBingo, showResult, allPairs[p], internalCard, internalDraw, internalRngString, internalDrawNumber)
    }
}

function solver(maxBingo, showResult, currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber){
    let predictedNextDraw = efficientPredictBingo(currentWeights, internalCard, internalDraw, internalRngString, internalDrawNumber)
    debugger;
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

