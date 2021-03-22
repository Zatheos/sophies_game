
document.addEventListener("DOMContentLoaded", function(event) { 
    playSomeGames(10);
});

const SUITS = {
    CLUBS: "c",
    HEARTS: "h",
    SPADES: "s",
    DIAMONDS: "d"
}

//currently not using this
const PRIORITIES = {
    SUIT:"suit",
    VALUE:"val",
    NEAR:"near",
    FAR:"far"
};

class Deck {
    constructor (){
        this.cards = []
        for (let suit in SUITS){
            for (let i = 1; i <= 13; i++){
                this.cards.push({val: i, suit: suit})
            }
        }
    }
    //uses the Durstenfeld shuffle algorithm; an optimized version of Fisher-Yates
    //https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
    shuffle() {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }
}

//==============================

function playGame(){
    let cardPiles = [];
    let deck = new Deck();
    
    deck.shuffle();
    
    //currently not using this
    let orderOfBias = [
        PRIORITIES.SUIT,
        PRIORITIES.VALUE,
        PRIORITIES.NEAR,
        PRIORITIES.FAR
    ];


    function playCard(){
        //using shift rather than pop because we always want to be dealing with the start of each array as the top card.
        let card = deck.cards.shift(0);
        
        //always create a new pile, but then assess whether we can collapse
        cardPiles.push([card]); 

        //check whether we can collapse card piles down. 
        //start from the end of the list and work back toward the start.
        let completedFullCheckWithNoChanges = false;
        while (!completedFullCheckWithNoChanges){
            completedFullCheckWithNoChanges = true;

            //Might be overkill to start again from the beginning any time a simplification has been made.
            // Could defo optimise this but probs not worth. 
            //NOTE: this for loop deliberately starts at the end and works back towards the beginning
            for (let i = cardPiles.length - 1; i > 0; i--){
                //the top card of the end pile - then penultimate etc.
                let cardToMatch = cardPiles[i][0];
                
                let matchesSuitWithAdj = cardToMatch.suit === cardPiles[i - 1][0].suit;
                let matchesValWithAdj = cardToMatch.val === cardPiles[i - 1][0].val;

                let matchesSuitWithNextButTwo = false; 
                let matchesValWithNextButTwo = false;
                
                //can only match with pile 3 spaces away if there are already 3 piles
                if (i >= 3){
                    matchesSuitWithNextButTwo = cardToMatch.suit === cardPiles[i - 3][0].suit;
                    matchesValWithNextButTwo = cardToMatch.val === cardPiles[i - 3][0].val;
                }
                
                //here we decide which matching to prioritise. 
                //change priorities by reordering these if-elses.

                //here we have a decision to make - this code unused for now
                // if ((matchesSuitWithAdj || matchesValWithAdj) && (matchesSuitWithNextButTwo || matchesValWithNextButTwo)){

                // }

                if (matchesSuitWithNextButTwo) {
                    cardPiles[i - 3].unshift(...cardPiles.splice(i, 1)[0])
                    completedFullCheckWithNoChanges = false;
                    break;
                }
                else if (matchesSuitWithAdj) {
                    cardPiles[i - 1].unshift(...cardPiles.splice(i, 1)[0]);
                    completedFullCheckWithNoChanges = false;
                    break;
                }
                else if (matchesValWithNextButTwo) {
                    cardPiles[i - 3].unshift(...cardPiles.splice(i, 1)[0])
                    completedFullCheckWithNoChanges = false;
                    break;
                }
                else if (matchesValWithAdj){
                    cardPiles[i - 1].unshift(...cardPiles.splice(i, 1)[0])
                    completedFullCheckWithNoChanges = false;
                    break;
                }
                //top card of "currently assessing" stack doesn't match. Check next stack.
            }
            //no stacks could be collapsed. Game is in simplest state. Card has been played.
        }
    }

    while (deck.cards.length > 0){
        playCard();
    }

    //print out stats for each individual game. Not using since we have the csv download
    
    // console.log(`Completed game with ${cardPiles.length} piles.`)
    // let cardCounts = [];
    // let stackToppers = [];
    // cardPiles.forEach(x=>cardCounts.push(x.length));;
    // cardPiles.forEach(x=>stackToppers.push(x[0]));
    // console.log(`Piles contain ${cardCounts.join(", ")} cards`);
    // console.log("Piles are topped by:");
    // stackToppers.forEach(x=>console.log(`${x.val} of ${x.suit}`));
    // console.table(cardPiles);
    return cardPiles.length;
}
function playSomeGames(n){
    let results = [];
    for (let i = 0; i < n; i++ ){
        results.push(playGame());
    }
    console.log(`played ${n} games.`);
    let sum = 0;
    let winCount = 0;
    let bigFailCount = 0;
    let max = 0;
    results.forEach(x=>{
        sum+=x;
        if (x===1) winCount++;
        else if (x===52) bigFailCount++;
        if (x>max)max = x;
    });
    
    console.log(`average pile count was ${Math.round((sum / n + Number.EPSILON) * 100) / 100}.`);
    console.log(`win count was ${winCount}.`);
    console.log(`big fail count was ${bigFailCount}.`);
    console.log(`maximum pile count was ${max}.`);
    
    //create csv download
    let csvContent = "data:text/csv;charset=utf-8," 
        + results.join("\n");
    var encodedUri = encodeURI(csvContent);
    window.open(encodedUri);
}
