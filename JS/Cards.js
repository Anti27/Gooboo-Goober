let cardStuff = getCardData();

function predictCards() {
    const div = document.getElementById("showCardsHere");
    let aggregate = document.getElementById("aggregateCardsHere");
    let amount = document.getElementById("cardAmount").value;
    if (amount < 1 && amount > 1000000) {amount = 10}
    var dict = JSON.parse(document.getElementById("saveData").innerHTML);
    while(div.firstChild) { div.removeChild(div.firstChild); }
    let selectedPack = document.getElementById("selectedPack").value;
    let pack = cardStuff.packs[selectedPack]
    let innerHtml = "<br><table><tr><th>" + selectedPack + "</th>";
    let info = []
    for (const [keyx, elemx] of Object.entries(pack.content)) {
        innerHtml += "<th>" + keyx + "<br>" + cardStuff.names[keyx] + "</th>"
        info.push([])
    }
    innerHtml += "</tr>";
    var prog = typeof parseInt(document.getElementById('cardRng').value) === "number" ? document.getElementById('cardRng').value : 0;
    for (let i = 0; i < amount; i++) {
        outputTextCards("------  " + (i + 1) + "  ------")
        let rngGen = new Math.seedrandom(document.getElementById('playerID').value + "cardPack_" + String(selectedPack) + "_" + (parseInt(prog) + i));
        let cacheWeight = [];
        let cacheContent = [];
        for (const [key, elem] of Object.entries(pack.content)) {
            cacheWeight.push(elem);
            cacheContent.push(key);
        }
        for (let j = 0, m = pack.amount; j < m; j++) { 
            let card = cacheContent[weightSelect(cacheWeight, rngGen())];
            let index = cacheContent.indexOf(card)
            info[index].push(i + 1)
            outputTextCards((dict.card.card.hasOwnProperty(String(card)) ? "" : "(New!) ") + cardStuff.names[card]);
        }
    }
    let aggregateAmount = document.getElementById("aggregateAmount").value;
    if (aggregateAmount < 1 && aggregateAmount > 1000) {aggregateAmount = 4}
    for (let i = 0; i < aggregateAmount; i++) {
        let row = i + 1
        innerHtml += "<tr><th>" + row + "</th>";
        for (let j = 0; j < info.length; j++){
            if (info[j][i] !== undefined) {
                innerHtml += "<th>" + info[j][i] + "</th>";
            } else {
                innerHtml += "<th>" + - + "</th>";
            }
        }
        innerHtml += "</tr>";
    } 
    
    innerHtml += "</table><br>";
    aggregate.innerHTML = innerHtml;
}

function outputTextCards(text, color = 0) {
    const para = document.createElement("p");
    para.style.color = colors[color];
    para.style.textShadow = "-1px -1px 2px black, 1px 1px 2px black, 1px -1px 2px black, -1px 1px 2px black, \
    -1px -1px 1px black, 1px 1px 1px black, 1px -1px 1px black, -1px 1px 1px black, \
    1px 0px 1px black, 0px 1px 1px black, -1px 0px 1px black, 0px -1px 1px black, \
    1px 0px 2px black, 0px 1px 2px black, -1px 0px 2px black, 0px -1px 2px black";
    para.style.margin = "0";
    para.style.fontSize = "19px";
    para.style.fontFamily = "Araboto";
    const node = document.createTextNode(text);
    para.appendChild(node);
    const element = document.getElementById("showCardsHere");
    element.appendChild(para);
}
