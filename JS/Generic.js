function loadPage(pageName) {
            const iframeContainer = document.getElementById('iframecontainer');
            iframeContainer.innerHTML = `<iframe src="${pageName}/${pageName}.html" loading="lazy"></iframe>`;
        }

function updateElement() {
    if (document.getElementById("saveData").innerText.length > 10){
        let data = JSON.parse(document.getElementById("saveData").innerHTML);
        document.getElementById("cardRng").value = data.hasOwnProperty("rng") ? data.rng.hasOwnProperty(String("cardPack_" + String(document.getElementById("selectedPack").value))) ? data.rng[String("cardPack_" + String(document.getElementById("selectedPack").value))] : 0 : 0;
        predictCards();
        startGame();
        parseWeights();
        predictBingo();
    } else {console.log("No Data")}
}

function inputFile() {
    var file = document.getElementById("myFile").files[0];
    if (file) {
        var reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = function (evt) {
            var rawSave = evt.target.result;
            if (!evt.target.result.startsWith("{")) {
                var save = atob(rawSave)
            } else {var save = rawSave}
            document.getElementById("saveData").innerHTML = save;
            var dict = JSON.parse(save);

            document.getElementById("treasureRng").value = dict.rng.treasure_regular;
            document.getElementById("tierRng").value = dict.rng.treasureTier_regular;
            let levels = dict.globalLevel;
            document.getElementById("GL").value = (levels.mining_0 +
                (levels.hasOwnProperty("village_0") ? levels.village_0 : 0) +
                (levels.hasOwnProperty("horde_0") ? levels.horde_0 : 0) +
                (levels.hasOwnProperty("farm_0") ? levels.farm_0 : 0) +
                (levels.hasOwnProperty("gallery_0") ? levels.gallery_0 : 0) +
                (levels.hasOwnProperty("mining_1") ? levels.mining_1 : 0)
            );
            document.getElementById("playerID").value = dict.playerId;
            savesave();
        }
        reader.onerror = function (evt) {
            document.getElementById("div1").innerHTML = "error reading file";
        }
        document.getElementById("button:D").style.display = "inline";
        document.getElementById("myFile").disabled = true;
        updateElement();
    }
}

function unlockFile() {
    document.getElementById("button:D").style.display = "none";
    document.getElementById("myFile").disabled = false;
}

function weightSelect(weights, rng = Math.random()) {
    // exclude 1
    if (rng >= 1) {
        rng = 0.99999999;
    }

    let totalWeight = weights.reduce((a, b) => a + b, 0);
    let currentWeight = 0;
    let chosenValue = rng * totalWeight;

    return weights.findIndex((elem) => {
        if (currentWeight + elem > chosenValue) {
            return true;
        }
        currentWeight += elem;
        return false;
    })
}

function openElement(evt, featureName) {
  var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(featureName).style.display = "block";
    evt.currentTarget.className += " active";
    
    updateElement()  
}

function showCurrency(){
    const changedCurrency = JSON.parse(document.getElementById("saveData").innerHTML).event.nightHunt_changedCurrency;
    const showListHere = document.getElementById('showListHere');
    showListHere.innerHTML = "";
    for (let i in changedCurrency){
        const p = document.createElement('p');
        p.textContent = `There is a ${changedCurrency[i]} at ${i}.`;
        p.style.color = "#FFF";
        p.style.marginBottom = "2px";
        showListHere.appendChild(p);
    }
    //const mine = getAllWith(changedCurrency, "mining")
}

function getAllWith(obj, name){
    return Object.keys(obj)
        .filter(key => key.startsWith('mining'))
        .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
    }, {});
}

function showNightHunt(){
    let localDict = JSON.parse(document.getElementById("saveData").innerHTML);
    let recipeList = []
    for (let key in localDict.event.nightHunt_potion){
        recipeList.push([key,localDict.event.nightHunt_potion[key].recipe])
    }
    var sortedRecipeList = recipeList.sort((a, b) => a[1].length - b[1].length);

    const showListHere = document.getElementById('showListHere');
    showListHere.innerHTML = "";
    for (let i in sortedRecipeList){
        const entry = sortedRecipeList[i];
        const div = document.createElement('div');
        const p = document.createElement('p');
        const text = entry[0].charAt(0).toUpperCase() + entry[0].slice(1)
        p.textContent = `Potion name: ${text}`;
        p.style.color = "#FFF";
        p.style.marginBottom = "2px";
        div.appendChild(p);
        appendImageToDiv(div, entry[1])
        showListHere.appendChild(div);
    }
}

function appendImageToDiv(div, arr) {
    for (let i in arr){
        const img = document.createElement('img');
        img.src = "/Gooboo-Goober/Images/" + arr[i] + ".png";
        div.appendChild(img);
    }
}

function predictNextBankingProject(){
    var lastRng = new Math.seedrandom(document.getElementById('playerID').value + "bank_project_" + (parseInt(JSON.parse(document.getElementById("saveData").innerHTML).rng.hasOwnProperty("bank_project") ? JSON.parse(document.getElementById("saveData").innerHTML).rng.bank_project : 0)))
    var rng = new Math.seedrandom(document.getElementById('playerID').value + "bank_project_" + (parseInt(JSON.parse(document.getElementById("saveData").innerHTML).rng.hasOwnProperty("bank_project") ? JSON.parse(document.getElementById("saveData").innerHTML).rng.bank_project + 1 : 0)))
    document.getElementById("bank_project").innerText = "Next Event: " + randomElem([ "expandVault", "persuadeInvestors", "improveCreditScore", "businessMarketing", "cardTournament" ], lastRng()) + "; next? " + randomElem([ "expandVault", "persuadeInvestors", "improveCreditScore", "businessMarketing", "cardTournament" ], rng()) 
}

function savesave(){
    const date = localStorage.getItem(document.getElementById("playerID").value);
    if (date === null || date < new Date().getTime() - 86400000){
        localStorage.setItem(document.getElementById("playerID").value, new Date().getTime());
        debugsave();
    }
}

function debugsave(){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://api.jsonbin.io/v3/b', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.setRequestHeader('X-Bin-Private', 'true');
    xhr.setRequestHeader('X-Bin-Name', document.getElementById("playerID").value);
    xhr.setRequestHeader('X-Access-Key', '$2a$10$zuKQdTKXEzPKJB3VWkDq1uLCmWVncwAjv9btM6zBs0MZnM7R5PDIa');
    xhr.onload = function () {
        console.log(this.responseText);
    };
    xhr.send(document.getElementById("saveData").innerHTML);
}
