localStorage.clear(); //make sure there aren't leftover decks from last time tests ran

tests({
  
  //flashcards.openDeck() - open/create deck
  
  'if no deck with specified name exists, it should create an empty deck object and set it to current deck': function() {
    flashcards.openDeck('apples');
    eq(flashcards.exposeDeck(), Object(flashcards.exposeDeck()));
  },
  
  'it should set current deck to the named deck from localStorage': function() {
    flashcards.openDeck('oranges');
    eq(flashcards.exposeDeck().name, 'oranges');
  },
  
  'it should throw TypeError if no name is given': function() {
    let error;
    try {
      flashcards.openDeck();
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
  },
      
  //flashcards.addCard() - add cards to current deck
  
  'it should create a new card object on the current deck, containing two sides': function() {
    localStorage.clear();
    flashcards.openDeck('animals');
    flashcards.addCard('lion', 'llew');
    eq(flashcards.exposeDeck().cards.length, 1);
    eq(flashcards.exposeDeck().cards[0], Object(flashcards.exposeDeck().cards[0]));
    eq(flashcards.exposeDeck().cards[0].side1[0], 'lion'); 
    eq(flashcards.exposeDeck().cards[0].side2[0], 'llew'); 
  },
  
  'it should save cards which were created earlier': function() {
    flashcards.openDeck('oranges');
    flashcards.openDeck('animals');
    flashcards.addCard('horse', 'ceffyl');
    eq(flashcards.exposeDeck().cards.length, 2);
    eq(flashcards.exposeDeck().cards[0].side1, 'lion');
    eq(flashcards.exposeDeck().cards[0].side2, 'llew');
  },

  'it should throw typeError if incomplete parameters are given (card must have at least 2 sides)': function() {
    localStorage.clear();
    let error;
    flashcards.openDeck('animals');
    try {
      flashcards.addCard('elephant');
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
    assertEquals(flashcards.exposeDeck().cards.length, 0);
  },
  
  'it should be possible to give a difficulty rating when creating a card': function() {
    localStorage.clear();
    flashcards.openDeck('animals');
    flashcards.addCard('elephant', 'eliffant', 1);
    flashcards.addCard('calf', 'llo', 10);
    flashcards.addCard('dog', 'ci', 0);
    assertEquals(flashcards.exposeDeck().cards[0].difficulty, 1);
    assertEquals(flashcards.exposeDeck().cards[1].difficulty, 10);
    assertEquals(flashcards.exposeDeck().cards[2].difficulty, 0);
  },

  'cards should have a default difficulty rating of 5': function() {
    flashcards.openDeck('animals');
    flashcards.addCard('seal', 'morlo');
    assertEquals(flashcards.exposeDeck().cards[3].difficulty, 5);
  },
  
  'it should throw typeError if a difficulty rating above 10 is given': function() {
    let error;
    flashcards.openDeck('animals');
    try {
      flashcards.addCard('fox', 'cadno', 12);
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
  },
  
  'it should throw typeError if a difficulty rating below 0 is given': function() {
    let error;
    flashcards.openDeck('animals');
    try {
      flashcards.addCard('fox', 'cadno', -3);
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
  },
  
  'it should throw typeError if difficulty is not a number': function() {
    let error;
    flashcards.openDeck('animals');
    try {
      flashcards.addCard('fox', 'cadno', 'a');
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
  },
  
  'it should accept multiple question/answers on each side': function() {
    flashcards.openDeck('multichoice');
    flashcards.addCard('fox', ['cadno', 'llwynog'], 7);
    eq(flashcards.exposeDeck().cards.length, 1);
    assert(Array.isArray(flashcards.exposeDeck().cards[0].side2));
    eq(flashcards.exposeDeck().cards[0].side2[0], 'cadno');
    eq(flashcards.exposeDeck().cards[0].side2[1], 'llwynog');
  },
  
  //flashcards.addCards() - add multiple cards to current deck
  
  'it should create and add multiple cards to the current deck': function() {
    flashcards.openDeck('multi');
    flashcards.addCards(['2 x 2', '4', 2], ['What is the capital of the UK?', 'London'], ['2 - 1', '1', 0]);
    eq(flashcards.exposeDeck().cards.length, 3);
  },
  
  'it should throw typeError and not add any if any argument is not an array': function() {
    let error;
    flashcards.openDeck('multi2');
    try {
      flashcards.addCards(['leopard', 'llewpart'], 'snake');
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
    eq(flashcards.exposeDeck().cards.length, 0);
  },
  
  'it should throw typeError and not add any cards if any argument does not include info for two sides': function() {
    let error;
    flashcards.openDeck('multi3');
    flashcards.addCard('cat', 'cath');
    try {
      flashcards.addCards(['dolphin', 'dolffin'], ['snake']);
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
    eq(flashcards.exposeDeck().cards.length, 1);
  },
  
  //flashcards.editCard()
  
  'it should be possible to change the values on either side of a card': function () {
    flashcards.openDeck('editable');
    flashcards.addCard('companion', 'ffrind');
    flashcards.editCard(0, 'side1', 'friend');
    flashcards.editCard(0, 'side2', ['cyfaill', 'ffrind']);
    eq(flashcards.exposeDeck().cards[0].side1.length, 1);
    eq(flashcards.exposeDeck().cards[0].side1[0], 'friend');
    eq(flashcards.exposeDeck().cards[0].side2.length, 2);
    eq(flashcards.exposeDeck().cards[0].side2[0], 'cyfaill');
    eq(flashcards.exposeDeck().cards[0].side2[1], 'ffrind');
  },
  
  'it should be possible to change the difficulty of a card': function () {
    flashcards.openDeck('editable');
    flashcards.editCard(0, 'difficulty', 8);
    eq(flashcards.exposeDeck().cards[0].difficulty, 8);
  },
  
  'it should reject any edited difficulty which is not a number from 0 to 1': function () {
    let error;
    flashcards.openDeck('editable');
    try {
      flashcards.editCard(0, 'difficulty', null);
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
  },
  
  //flashcards.addToCard()
  
  'it should be possible to add new acceptable answers to either side of a card': function () {
    flashcards.openDeck('addable');
    flashcards.addCards(['road', 'ffordd', 7], ['thank you', ['diolch yn fawr', 'diolch'], 2]);
    flashcards.addToCard(0, 'side1', 'way');
    flashcards.addToCard(1, 'side2', 'diolch yn fawr iawn');
    eq(flashcards.exposeDeck().cards[0].side1.length, 2);
    eq(flashcards.exposeDeck().cards[0].side1[1], 'way');
    eq(flashcards.exposeDeck().cards[1].side2.length, 3);
    eq(flashcards.exposeDeck().cards[1].side2[2], 'diolch yn fawr iawn');
  },
  
  //flashcards.deleteCard()
  
  'it should be possible to delete a specific card from the current deck by giving its position in the deck': function () {
    flashcards.openDeck('animals');
    let deckLen = flashcards.exposeDeck().cards.length;
    let card1side1 = flashcards.exposeDeck().cards[1].side1;
    flashcards.deleteCard(0);
    eq(flashcards.exposeDeck().cards.length, deckLen - 1);
    eq(flashcards.exposeDeck().cards[0].side1, card1side1);
  },
  
  //flashcards.deleteCurrentDeck()
  
  'it should permanently delete the named deck from local storage': function () {
    flashcards.openDeck('animals');
    flashcards.deleteDeck('animals');
    eq(localStorage.getItem('deck-animals'), undefined);
    flashcards.openDeck('animals');
    eq(flashcards.exposeDeck().cards.length, 0);
  },
  
  //flashcards.drawNext()
  
  'it should first return info from the 0th card in the deck, as an object containing the question and the difficulty score': function () {
    flashcards.openDeck('animals');
    flashcards.addCards(['sheep', 'dafad', 7], ['cat', 'cath'], ['horse', ['ceffyl', 'march'], 7]);
    let x = flashcards.drawNext();
    eq(x.question[0], 'sheep');
    eq(x.difficulty, 7);
  },

  'it should next return the 1st card in the cards array': function () {
    let x = flashcards.drawNext();
    eq(x.question[0], 'cat');
    eq(x.difficulty, 5);
  },
  
  'it should reset and return the 0th card in the cards array if the deck is re-opened': function () {
    flashcards.openDeck('animals');
    let x = flashcards.drawNext();
    eq(x.question[0], 'sheep');
  },
  
  'after the final card in the array is drawn, it should return false': function () {
    let x;
    flashcards.openDeck('animals');
    for (let i = 0; i <= 3; i ++) {
      x = flashcards.drawNext();
    }
    eq(x, false);
  },
  
  'if min & max arguments are given, it should return the first card whose difficulty falls between them': function () {
    flashcards.openDeck('minmax');
    flashcards.addCards(['blue + yellow', 'green', 2], ['red + yellow', 'orange', 8]);
    let x = flashcards.drawNext(3, 9);
    eq(x.question[0], 'red + yellow');
  },
  
  'if no max difficulty is given, it should return the next card with difficulty from min to 10': function () {
    flashcards.openDeck('minmax');
    flashcards.addCard('white + black', 'grey', 9);
    let x = flashcards.drawNext(9);
    eq(x.question[0], 'white + black');
  },
  
  'if deck has no cards in the selected difficulty range, it should return false': function () {
    flashcards.openDeck('minmax');
    let x = flashcards.drawNext(4, 7);
    eq(x, false);
  },
  
  'if deck has no cards, it should return false': function () {
    flashcards.deleteDeck('minmax');
    flashcards.openDeck('minmax');
    let x = flashcards.drawNext();
    eq(x, false);
  },
  
  // flashcards.flipDeck()
  'for all cards in the current deck, it should swap which side is shown as the question, and which holds the answer': function () {
    let x, y;
    flashcards.flipDeck();
    flashcards.openDeck('animals');
    x = flashcards.drawNext();
    eq(x.question[0], 'dafad');
    flashcards.flipDeck();
    y = flashcards.drawNext();
    eq(y.question[0], 'cat');
  },
  
  //flashcards.checkAnswer()
  
  'it should return outcome:true if the argument is included in the card array of possible answers': function () {
    flashcards.openDeck('animals');
    flashcards.drawNext();
    assert(flashcards.checkAnswer('dafad').outcome);
  },
  
  'it should return outcome:false if the argument is not included in the card array of possible answers': function () {
    flashcards.openDeck('animals');
    flashcards.drawNext();
    eq(flashcards.checkAnswer('cath').outcome, false);
  },
    
  'it should decrease the card difficulty and return new difficulty if the answer is correct': function () {
    flashcards.openDeck('testdeck');
    flashcards.addCard('What is 2+2?', '4', 2);
    flashcards.drawNext();
    let res = flashcards.checkAnswer('4'),
        diffSetting = flashcards.settings.adjustDifficultyDown;
    eq(res.outcome, true);
    eq(res.newDifficulty, 2 + diffSetting);
  },
  
  'it should increase the card difficulty and return new difficulty if the answer is false': function () {
    localStorage.clear();
    flashcards.openDeck('testdeck');
    flashcards.addCard('What is 2+2?', ['4', 'four'], 2);
    flashcards.drawNext();
    let res = flashcards.checkAnswer('5'),
        diffSetting = flashcards.settings.adjustDifficultyUp;
    eq(res.outcome, false);
    eq(res.newDifficulty, 2 + diffSetting);
  },
  
  'it should never allow difficulty to go below 0': function () {
    localStorage.clear();
    flashcards.openDeck('testdeck');
    flashcards.addCard('5 - 1', '4', 0);
    flashcards.drawNext();
    let res = flashcards.checkAnswer('4');
    eq(res.newDifficulty, 0);
  },
  
  'it should never allow difficulty to go above 10': function () {
    localStorage.clear();
    flashcards.openDeck('testdeck');
    flashcards.addCard('3 x 3', '9', 10);
    flashcards.drawNext();
    let res = flashcards.checkAnswer('100');
    eq(res.newDifficulty, 10);
  },
  
  'it should return an array of all possible correct answers': function () {
    localStorage.clear();
    flashcards.openDeck('testdeck');
    flashcards.addCard('What is 2+2?', ['4', 'four'], 2);
    flashcards.drawNext();
    let outcome = flashcards.checkAnswer('5');
    assert(Array.isArray(outcome.answers));
    eq(outcome.answers.length, 2);
    eq(outcome.answers[0], '4');
    eq(outcome.answers[1], 'four');
  },
  
  //flashcards.revealAnswer()
  
  'it should reveal the answer(s) and difficulty to the current card, without affecting the score or difficulty': function () {
    flashcards.openDeck('revealer');
    flashcards.addCard('My question', 'Answer to reveal', 5);
    flashcards.drawNext();
    let a = flashcards.revealAnswer().answers,
        diff = flashcards.revealAnswer().difficulty;
    eq(a[0], 'Answer to reveal');
    eq(diff, 5);
    eq(flashcards.exposeDeck().cards[0].difficulty, 5);
  },
  
  //flashcards.shuffle()
  
  'it should shuffle the current deck without removing/adding any cards': function () {
    flashcards.openDeck('shuffledeck');
    flashcards.addCards(['first card', 'cerdyn cyntaf'], ['second card', 'ail gerdyn'], ['third card', 'trydydd cerdyn']);
    flashcards.shuffle();
    eq(flashcards.exposeDeck().cards.length, 3);
  },
  
  'shuffling should reset the current index': function () {
    let firstcard;
    flashcards.openDeck('shuffledeck');
    flashcards.drawNext();
    flashcards.shuffle();
    firstcard = flashcards.exposeDeck().cards[0].side1;
    nextquestion = flashcards.drawNext().question;
    eq(nextquestion, firstcard);
  },
  
  //flashcards.getDeckLength()
  
  'it should return the number of cards in the currently-open deck as an integer': function () {
    flashcards.openDeck('shortdeck');
    flashcards.addCards(['a', 'A'], ['b', 'B'], ['c', 'C'], ['d', 'D']);
    eq(flashcards.deckLength(), 4);
  },
  
  //flashcards.draw(index)
  
  'it should return an object containing question and difficulty of card at index': function () {
    flashcards.openDeck('selectdeck');
    flashcards.addCards(['a', 'A'], ['b', 'B', 8], ['c', 'C'], ['d', 'D']);
    let card = flashcards.draw(1);
    eq(card.question, 'b');
    eq(card.difficulty, 8);
  },
  
  'if there is no card at the index, it should return false': function () {
    flashcards.openDeck('selectdeck');
    let card = flashcards.draw(4);
    eq(card, false);
  },
  
  //flashcards.getSessionInfo()
  
  'it should return an object containing no. of cards correct since deck opened': function () {
    flashcards.openDeck('sessiondeck');
    flashcards.addCards(['a', 'A'], ['b', 'B', 8], ['c', 'C'], ['d', 'D']);
    flashcards.drawNext();
    flashcards.checkAnswer('N'); //wrong answer
    flashcards.drawNext();
    flashcards.checkAnswer('B'); //right answer
    let sessionInfo = flashcards.getSessionInfo();
    eq(sessionInfo.correct, 1);
  },
  
  'it should contain no. of cards incorrect since deck opened': function () {
    let sessionInfo = flashcards.getSessionInfo();
    eq(sessionInfo.incorrect, 1);
  },
  
  'it should contain an array of card indexes which were incorrectly answered': function () {
    let sessionInfo = flashcards.getSessionInfo();
    eq(Array.isArray(sessionInfo.incorrectCards), true);
    eq(sessionInfo.incorrectCards.length, 1);
    eq(sessionInfo.incorrectCards[0], 0);
  },
  
  'it should contain an array of card indexes which were correctly answered': function () {
    let sessionInfo = flashcards.getSessionInfo();
    eq(Array.isArray(sessionInfo.correctCards), true);
    eq(sessionInfo.correctCards.length, 1);
    eq(sessionInfo.correctCards[0], 1);
  },
  
  'it should contain the index of the current card': function () {
    flashcards.openDeck('sessiondeck2');
    flashcards.addCards(['x', 'X']);
    flashcards.drawNext();
    let info = flashcards.getSessionInfo();
    eq(info.currentIndex, 0);
  },
  
  //flashcards.setSessionInfo()
  
  'it should set sessionInfo to match an argument object with values for each sessionInfo key': function () {
    flashcards.openDeck('sessionTest');
    flashcards.addCards(['1', 'one'], ['2', 'two'], ['3', 'three']);
    let newSI = {
      correct: 1,
      incorrect: 1,
      correctCards: [1],
      incorrectCards: [0],
      currentIndex: 2
    };
    flashcards.setSessionInfo(newSI);
    let si = flashcards.getSessionInfo();
    eq(si.correct, newSI.correct);
    eq(si.incorrect, newSI.incorrect);
    eq(si.correctCards[0], newSI.correctCards[0]);
    eq(si.incorrectCards[0], newSI.incorrectCards[0]);
    eq(si.currentIndex, newSI.currentIndex);
  },
  
  'it should throw typeError if the argument object is missing a value for any sessionInfo key': function () {
    let error;
    try {
      flashcards.setSessionInfo({correct: 10, correctCards: [1]});
    } catch(e) {
      error = e;
    }
    assert(error instanceof TypeError);
  },
  
  'it should not change sessionInfo if the argument object is missing any values': function () {
    try {
      flashcards.setSessionInfo({correct: 10, correctCards: [1]});
    } catch (e) {}
    eq(flashcards.getSessionInfo().correct === 10, false);
  },
  
  //flashcards.listDecks()
  
  'it should return an array of objects representing decks currently in localStorage': function () {
    localStorage.clear();
    flashcards.openDeck('my-first-deck');
    flashcards.openDeck('mySecondDeck');
    let x = flashcards.listDecks();
    eq(x.length, 2);
  },
  
  'each object should contain a value for name and displayName': function () {
    localStorage.clear();
    flashcards.openDeck('my-first-deck');
    flashcards.openDeck('mySecondDeck');
    flashcards.setDisplayName('MY SECOND DECK!');
    let x = flashcards.listDecks();
    eq(x.length, 2);
    eq(x[0].name, 'my-first-deck');
    eq(x[0].displayName, 'my-first-deck');
    eq(x[1].name, 'mySecondDeck');
    eq(x[1].displayName, 'MY SECOND DECK!');
  },
  
  'it should exclude anything in localStorage which is not a deck': function () {
    localStorage.setItem('notADeck', 'do not return me');
    let x = flashcards.listDecks();
    eq(x.length, 2);
  },
  
  'it should return an empty array if there are no decks': function () {
    localStorage.clear();
    let x = flashcards.listDecks();
    assert(Array.isArray(x));
    eq(x.length, 0);
  },
  
  //flashcards.setDisplayName(), flashcards.getDisplayName()
  
  'it should add a displayName attribute to the open deck': function () {
    let newName = 'My Best Deck';
    flashcards.openDeck('namedDeck');
    flashcards.setDisplayName(newName);
    eq(flashcards.exposeDeck().displayName, newName);
  },
  
  'it should overwrite the existing displayName if there is one': function () {
    let newName = 'My Best Deck';
    let newerName = '100% Better Deck';
    flashcards.openDeck('secondNamedDeck');
    flashcards.setDisplayName(newName);
    flashcards.setDisplayName(newerName);
    eq(flashcards.exposeDeck().displayName, newerName);
  },
  
  'it should return the currently-open deck display name as a a string': function () {
    let expectedName = 'Words for Food'
    flashcards.openDeck('thirdNamedDeck');
    flashcards.setDisplayName(expectedName);
    eq(flashcards.getDisplayName(), expectedName);
  },
  
  'it should return the short deck name if there is no display name set': function () {
    flashcards.openDeck('unnamed');
    eq(flashcards.getDisplayName(), 'unnamed');
  },
  
  'it should return the short deck name if the display name has 0 characters': function () {
    flashcards.openDeck('unnamed2');
    flashcards.setDisplayName('');
    eq(flashcards.getDisplayName(), 'unnamed2');
  }
	
});
  
localStorage.clear(); //make sure there aren't leftover decks
