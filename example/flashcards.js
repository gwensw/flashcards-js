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
    adjustDifficultyDown: -1
  };
  
  /* --- STORAGE (INTERNAL) --- */
  
  let __currentDeck = false,
      __name = false,
      __currentIndex = -1;

  /* --- HELPER METHODS & CONSTRUCTORS (INTERNAL) --- */
  
  //save the current deck to localStorage
  function saveDeck () {
    if (__currentDeck) {
      localStorage.setItem(`deck-${__name}`, JSON.stringify(__currentDeck));
    }
  }
  
  //return true if difficulty setting is a valid number / undefined
  function isValidDifficulty (n) {
    return n === undefined ? true : typeof n === 'number' && n <= 10 && n >= 0;
  }
  
  function Deck (name) {
    this.name = name || 'temp';
    this.cards = [];
  }

  function Card (info) {
    this.side1 = Array.isArray(info.side1) ? info.side1 : [info.side1];
    this.side2 = Array.isArray(info.side2) ? info.side2 : [info.side2];
    this.difficulty = (info.difficulty === undefined) ? 5 : info.difficulty;
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
    __currentIndex = -1;
    __name = name;
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
    __currentDeck.cards.splice(index, 1);
    saveDeck();
  };
  
  //delete a deck from localstorage and set __currentDeck to false
  lib.deleteDeck = function (name) {
    localStorage.removeItem(`deck-${name}`);
    if (name === __name) {
      __currentDeck = false;
    }
  };
  
  //draw the next card in the deck (if it falls within specified difficulty parameters)
  lib.drawNext = function(minDiff, maxDiff) {
    let min = minDiff || 0,
        max = maxDiff || 10,
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
    attempt = settings.caseSensitive ? attempt : attempt.toLowerCase();
    let i,
        answer,
        bool = false,
        card = __currentDeck.cards[__currentIndex],
        answers = card[settings.answerSide],
        newDiff = card.difficulty;
    for (let i = 0; i < answers.length; i++) {
      answer = settings.caseSensitive ? answers[i] : answers[i].toLowerCase();
      if (attempt === answer) {
        bool = true;
        break;
      }
    }
    //calculate new card difficulty
    newDiff += bool ? settings.adjustDifficultyDown : settings.adjustDifficultyUp;
    //make sure new card difficulty is within range, else stay the same
    card.difficulty = isValidDifficulty(newDiff) ? newDiff : card.difficulty;
    //save deck to localstorage
    saveDeck();
    return {
      outcome: bool,
      newDifficulty: card.difficulty,
      answers: answers
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
    //reset __currentIndex
    __currentIndex = -1;
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
  
  //for testing
  lib.exposeDeck = function() {
    return __currentDeck;
  };

  /* --- DECLARE MODULE --- */

  // Declare 'flashcards' on the (global/window) object, i.e. 'this':
  root.flashcards = lib;

}(this));