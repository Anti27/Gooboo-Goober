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
