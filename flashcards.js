/*jshint esversion:6, devel: true, browser: true*/

(function(root) {

  /* --- SETUP --- */

  // Create local library object
  const lib = {};

  /* --- SETTINGS (EXTERNAL) --- */
	
  // Exposed settings configuration object. Aliased.
  const settings = lib.settings = {
    questionSide: 'side1', // side shown as prompt
    answerSide: 'side2', // hidden side listing correct answer(s)
    caseSensitive: false, // should answer be checked for precise caps?
    adjustDifficultyUp: 1,
    adjustDifficultyDown: -1,
		lowestDifficulty: 0, //lowest possible difficulty for cards
		highestDifficulty: 10 //highest possible difficulty for cards
  };
  
  /* --- STORAGE (INTERNAL) --- */
  
  let __currentDeck = false,
      __name = false,
      __currentIndex = -1;
  
  const __sessionInfo = {
    correct: 0,
    incorrect: 0,
    correctCards: [],
    incorrectCards: [],
  };

  /* --- HELPER METHODS & CONSTRUCTORS (INTERNAL) --- */
	
	function calculateDefault () {
		return settings.defaultDifficulty ? settings.defaultDifficulty : Math.round((settings.highestDifficulty - settings.lowestDifficulty) / 2);
	}
  
  //save the current deck to localStorage
  function saveDeck () {
    if (__currentDeck) {
      localStorage.setItem(`deck-${__name}`, JSON.stringify(__currentDeck));
    }
  }
  
  //resets current session info and sets currentIndex to -1
  function reset () {
    __currentIndex = -1;
    __sessionInfo.correct = 0;
    __sessionInfo.incorrect = 0;
    __sessionInfo.correctCards = [];
    __sessionInfo.incorrectCards = [];
  }
  
  //return true if difficulty setting is a valid number / undefined
  function isValidDifficulty (n) {
    return n === undefined ? true : typeof n === 'number' && n <= settings.highestDifficulty && n >= settings.lowestDifficulty;
  }
	
	//returns the average difficulty of an array of cards
	function averageDifficulty (cards) {
		if (!cards.length) {
			return null;
		}
		let sum = cards.reduce( (acc, val) => {
			return {difficulty: parseInt(acc.difficulty) + parseInt(val.difficulty)};
		}).difficulty;
		return Math.round(sum / cards.length);
	}
  
  function Deck (name) {
    this.name = name || 'temp';
    this.displayName = name;
    this.cards = [];
  }

  function Card (info) {
    this.side1 = Array.isArray(info.side1) ? info.side1 : [info.side1];
    this.side2 = Array.isArray(info.side2) ? info.side2 : [info.side2];
    this.difficulty = (info.difficulty === undefined) ? calculateDefault() : info.difficulty;
  }

  /* --- API METHODS --- */

  //change the current deck
  lib.openDeck = function (name) {
    if (!name) {
      throw new TypeError('Must specify a deck name to open');
    }
    if (localStorage.getItem(`deck-${name}`) === null) {
      localStorage.setItem(`deck-${name}`, JSON.stringify(new Deck(name)));
    }
    __currentDeck = JSON.parse(localStorage.getItem(`deck-${name}`));
    __name = name;
    reset();
  };
  
  //create a new card and add to the current deck
  lib.addCard = function (side1, side2, difficulty) {
    if (arguments.length < 2 || arguments.length > 3) {
      throw new TypeError('Cards must have exactly 2 sides');
    }
    if (!isValidDifficulty(difficulty)) {
      throw new TypeError('Difficulty must be a number between 0 and 1');
    }
    let info = {
      difficulty: difficulty,
      side1: side1,
      side2: side2
    };
    __currentDeck.cards.push(new Card(info));
    saveDeck();
  };
  
  //takes any number of arrays ([side1, side2, difficulty]) and creates one card per array on the current deck
  lib.addCards = function () {
    for (let i = 0; i < arguments.length; i++) {
      if (Array.isArray(arguments[i]) && arguments[i].length >= 2) {
        this.addCard(arguments[i][0], arguments[i][1], arguments[i][2]);
      } else {
        __currentDeck.cards.splice(__currentDeck.cards.length - i, i+1);
        throw new TypeError('Each card array must contain data for exactly 2 card sides');
      }
    }
    saveDeck();
  };
  
  //edit any attribute of a card
  lib.editCard = function (index, attribute, newVal) {
    if (__currentDeck.cards[index] === undefined) {
      throw new TypeError('No card at that index');
    } else if (arguments.length !== 3) {
      throw new TypeError('Must have three arguments');
    }
    switch (attribute) {
      case 'side1':
        __currentDeck.cards[index].side1 = Array.isArray(newVal) ? newVal : [newVal];
        break;
      case 'side2':
        __currentDeck.cards[index].side2 = Array.isArray(newVal) ? newVal : [newVal];
        break;
      case 'difficulty':
        if (!isValidDifficulty(newVal)) {
          throw new TypeError('Difficulty must be a number from 0 to 1');
        }
        __currentDeck.cards[index].difficulty = newVal;
        break;
      default:
        throw new TypeError('The second argument must be difficulty or a valid side');
    }
    saveDeck();
  };
  
  //adds new acceptable answers to one side of a card
  lib.addToCard = function (index, side, newVal) {
    if (__currentDeck.cards[index][side] === undefined) {
      throw new TypeError('Must choose a valid card and side');
    } else if (arguments.length !== 3) {
      throw new TypeError('Must have three arguments');
    }
    __currentDeck.cards[index][side].push(newVal);
    saveDeck();
  };
  
  //delete a card at the given index in the current deck
  lib.deleteCard = function (index) {
    if (index !== undefined) {
      __currentDeck.cards.splice(index, 1);
    }
    saveDeck();
  };
  
  //delete a deck from localstorage and set __currentDeck to false
  lib.deleteDeck = function (name) {
    localStorage.removeItem(`deck-${name}`);
    if (name === __name) {
      __currentDeck = false;
    }
  };
  
  //draw the card with the specified index
  lib.draw = function (index) {
    __currentIndex = index;
    return __currentDeck.cards[index] ? 
          { question: __currentDeck.cards[index][settings.questionSide], difficulty: __currentDeck.cards[index].difficulty }
          : false;
  };
  
  //draw the next card in the deck (if it falls within specified difficulty parameters)
  lib.drawNext = function (minDiff, maxDiff) {
    let min = minDiff || settings.lowestDifficulty,
        max = maxDiff || settings.highestDifficulty,
        card,
        i,
        len = __currentDeck.cards.length;
    if (len === 0 || __currentIndex >= len - 1) {
      return false;
    }
    for (i = 0; i < len; i++) {
      __currentIndex += 1;
      card = __currentDeck.cards[__currentIndex];
      if (card.difficulty >= min && card.difficulty <= max) {
        return {
          question: card[settings.questionSide],
          difficulty: card.difficulty,
        };
      }
    }
    return false;
  };
  
  //check if attempt is correct & change card difficulty up/down
  lib.checkAnswer = function(attempt) {
    let i,
        answer,
        bool = false,
        card = __currentDeck.cards[__currentIndex],
        answers = card[settings.answerSide],
        newDiff = card.difficulty;
    
    attempt = settings.caseSensitive ? attempt : attempt.toLowerCase();
    
    //check if attempt is correct
    for (let i = 0; i < answers.length; i++) {
      answer = settings.caseSensitive ? answers[i] : answers[i].toLowerCase();
      if (attempt === answer) {
        __sessionInfo.correct += 1;
        __sessionInfo.correctCards.push(__currentIndex);
        bool = true;
        break;
      }
    }
    
    if (!bool) {
      __sessionInfo.incorrect += 1;
      __sessionInfo.incorrectCards.push(__currentIndex);
    }
    
    //calculate card's new difficulty
    newDiff += bool ? settings.adjustDifficultyDown : settings.adjustDifficultyUp;
    card.difficulty = isValidDifficulty(newDiff) ? newDiff : card.difficulty;
    
    //save deck to localstorage and return outcome
    saveDeck();
    return {
      outcome: bool,
      newDifficulty: card.difficulty,
      answers: answers
    };
  };
  
  //return the current card's answers and difficulty as an array, without affecting difficulty/progress
  lib.revealAnswer = function() {
    return {
      answers: __currentDeck.cards[__currentIndex][settings.answerSide],
      difficulty: __currentDeck.cards[__currentIndex].difficulty
    };
  };
  
  //randomly re-order the cards
  lib.shuffle = function () {
    //take __currentDeck cards, reorder them (Durstenfeld Shuffle)
    const cards = __currentDeck.cards;
    for (let i = cards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }
    //reset __currentIndex and session info
    reset();
    //save the current deck
    saveDeck();
  };
  
  //swap which card side is given as question, and which holds the answer
  lib.flipDeck = function () {
    let x = settings.questionSide;
    settings.questionSide = settings.answerSide;
    settings.answerSide = x;
  };
  
  //return number of cards in open deck
  lib.deckLength = function () {
    return __currentDeck.cards.length;
  };
  
  //return info about current session
  lib.getSessionInfo = function () {
    __sessionInfo.currentIndex = __currentIndex;
    return __sessionInfo;
  };
  
  //manipulate session info values
  lib.setSessionInfo = function (newSessionInfo) {
    if (!Number.isInteger(newSessionInfo.correct) || !Number.isInteger(newSessionInfo.incorrect) || !Array.isArray(newSessionInfo.correctCards) || !Array.isArray(newSessionInfo.incorrectCards) || !Number.isInteger(newSessionInfo.currentIndex)) {
      throw new TypeError('Missing or illegal value for sessionInfo');
    } else {
      __sessionInfo.correct = newSessionInfo.correct;
      __sessionInfo.incorrect = newSessionInfo.incorrect;
      __sessionInfo.correctCards = newSessionInfo.correctCards;
      __sessionInfo.incorrectCards = newSessionInfo.incorrectCards;
      __currentIndex = newSessionInfo.currentIndex;
    }
  };
  
  //return array of decks in localStorage (along with name, displayName, no. of cards, average difficulty)
  lib.listDecks = function () {
    const names = [],
          len = localStorage.length;
    let i;
    for (i = 0; i < len; i++) {
      //match and strip 'deck-' keys
      let name = localStorage.key(i).match(/deck-(.*)/),
          obj = {},
					parsed;
      if (name) {
				parsed = JSON.parse(localStorage.getItem(name[0]));
        obj.name = name[1];
        obj.displayName = parsed.displayName;
        names.push(obj);
				obj.averageDifficulty = averageDifficulty(parsed.cards);
				obj.cardLength = parsed.cards.length;
      }
    }
    return names;
  };
  
  //give the deck a longform display name (optional)
  lib.setDisplayName = function (str) {
    str = str.toString();
    __currentDeck.displayName = str;
    saveDeck();
  };
  
  //return the display name as a string (if display name is blank, return shortform name)
  lib.getDisplayName = function () {
    return __currentDeck.displayName.length ? __currentDeck.displayName : __currentDeck.name;
  };
  
  //for testing
  lib.exposeDeck = function() {
    return __currentDeck;
  };


  /* --- DECLARE MODULE --- */

  // Declare 'flashcards' on the (global/window) object, i.e. 'this':
  root.flashcards = lib;

}(this));