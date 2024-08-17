let cardStuff = getCardData();

function predictCards() {
    const div = document.getElementById("showCardsHere");
    var dict = JSON.parse(document.getElementById("saveData").innerHTML);
    while(div.firstChild) { div.removeChild(div.firstChild); }
    let selectedPack = document.getElementById("selectedPack").value;
    let pack = cardStuff.packs[selectedPack]
    var prog = typeof parseInt(document.getElementById('cardRng').value) === "number" ? document.getElementById('cardRng').value : 0;
    for (let i = 0; i < 10; i++) {
        outputText("------  " + (i + 1) + "  ------")
        let rngGen = new Math.seedrandom(document.getElementById('playerID').value + "cardPack_" + String(selectedPack) + "_" + (parseInt(prog) + i));
        let cacheWeight = [];
        let cacheContent = [];
        for (const [key, elem] of Object.entries(pack.content)) {
            cacheWeight.push(elem);
            cacheContent.push(key);
        }
        for (let j = 0, m = pack.amount; j < m; j++) { 
            let card = cacheContent[weightSelect(cacheWeight, rngGen())];
            outputText((dict.card.card.hasOwnProperty(String(card)) ? "" : "(New!) ") + cardStuff.names[card]);
        }
    }
}
