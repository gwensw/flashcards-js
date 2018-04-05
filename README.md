# Flashcards.js

A mini JS library which provides the logic for browser-based flashcard apps [like this one](https://benwig.github.io/flashcards-example/index.html).

Makes use of local storage to save and recall decks of flashcards which can be drilled and edited. Cards have an interchangeable question side and answer side, and a difficulty rating which changes to reflect how often you've got the answer right/wrong.

Read the [tests](https://github.com/benwig/flashcards-js/blob/master/tests/tests.js).

To use, include the _flashcards.js_ file in your project or link to the [Rawgit](https://cdn.rawgit.com/benwig/flashcards-js/master/flashcards.js). If you'd rather build off an existing UI, you can go grab a copy of the [example project](https://github.com/benwig/flashcards-example) instead.

## Basic Example

```javascript
// create a deck, or open an existing deck
flashcards.openDeck('testdeck');

// add a card to the open deck
flashcards.addCard('What is the capital of the UK?', 'London');

// add another card. This one has two possible answers.
flashcards.addCard('What is the capital of Brazil?', ['Rio', 'Rio de Janeiro']);

// add multiple cards. Each card is an array like [side1, side2, difficulty(optional)]
flashcards.addCards(['What is your favourite colour?', 'blue', 1], ['Tallest mountain on earth?', ['Everest', 'Chomolungma'], 3]);

// shuffle the deck to randomly re-order the cards.
flashcards.shuffle();

// draw the first card from the deck. Returns an object with 'question' as array and 'difficulty' as integer.
// Returns false if no cards in deck or all cards have been drawn.
var currentCard = flashcards.drawNext();
currentCard.question //['What is your favourite colour?']
currentCard.difficulty //1

// Pass in an attempt for the current card, and get the outcome.
// If false, card's difficulty will increase +1
// If correct, difficulty will decrease -1
// Function returns an object with 'outcome' (bool), 'newDifficulty' (integer) and 'answers' (array of all possible answers).
var myTry = flashcards.checkAnswer('5');
myTry.outcome //false
myTry.newDifficulty //2
myTry.answers //['4']

// delete the deck from localStorage
flashcards.deleteDeck('testdeck');

```

## Fundamental Methods

### flashcards.openDeck(_name_)
Creates a new deck, or opens an existing deck of that name. Every action from now on will affect the open deck.

### flashcards.addCard(_side1, side2, difficulty_)
Adds a new card to the current deck, specifying what text should appear on either side.

_side1_ is the default 'question' side. _side2_ is the default 'answer' side. If you want to provide multiple possible questions/answers, pass in an array of strings.

_difficulty_ is optional, and should be an integer between 0 and 10. It defaults to 5.

### flashcards.addCards(_array_, ...)
Adds multiple cards to the current deck. Information for each card should be in an array following the pattern [_side1_, _side2_, _difficulty_]

### flashcards.drawNext(_min, max_)
Each time it's used, it draws the next card from the deck.

Returns an object representing the card with 'question' as array and 'difficulty' as integer.

Only returns cards whose difficulty are between the optional _min_ and _max_ integers. If only _min_ is given, return any cards from _min_ to 10.

Returns _false_ if no cards are left in the deck which match the criteria.

### flashcards.checkAnswer(_attempt_)
Accepts an attempt (string) for the current card, and checks it against the card's possible correct answers. If incorrect, card's difficulty will increase +1 (up to a limit of 10). If correct, card's difficulty will decrease -1 (down to a limit of 0).

Returns an object with 'outcome' (bool), 'newDifficulty' (integer) and 'answers' (array of all possible answers).

Note that this changes the difficulty of the card each time it's called, so only call it for actual attempts!

### flashcards.revealAnswer()
Reveals the current card's answer and difficulty, without making an attempt or changing the difficulty.

Returns an object with 'answers' (array) and 'difficulty' (integer).

### flashcards.shuffle()
Randomly re-orders the cards in the current deck. drawNext() will now start from card index 0.

## Further Methods

### flashcards.flipDeck()
Swaps which sides of the card are used for question and answer.

### flashcards.draw(_index_)
Draw the card with this specific index from the current deck.

Like _drawNextCard()_, it returns an object representing the card, with 'question' as array and 'difficulty' as integer.

Returns _false_ if there is no card at that index.

### flashcards.editCard(_index, attribute, newVal_)
Replace a card's attribute with a new value.
_attribute_ must be _side1_,  _side2_ or _difficulty_. For example:
```javascript
flashcards.openDeck('testdeck2');
flashcards.addCard('2 x 2?', '5');
flashcards.editCard(0, 'side2', '4');
flashcards.exposeDeck().cards[0].side2 //['4']
```
### flashcards.deleteCard(_index_)
Deletes the card at the given index in the current deck.

### flashcards.deleteDeck(_name_)
Permanently deletes the named deck from local storage.

## Methods for nosy people
Expose various bits of data which you may find helpful when developing a front-end.

### flashcards.getSessionInfo()
Returns an object with information about what's happened since the deck was most recently opened.

Looks like this:
```javascript
{ "correct": 3,
  "incorrect": 2,
  "correctCards": [0, 2, 3],
  "incorrectCards": [1, 4],
  "currentIndex": 5 }
```

### flashcards.setSessionInfo(_object_)
Overwrite the session info with your own values. Useful if you want to restore a saved session, since by default, _flashcards.openDeck()_ starts a fresh session. 

Requires an object with identical keys to what's returned with _getSessionInfo()_

### flashcards.setDisplayName(_displayName_)
Attaches a Display Name to the currently open deck. Unlike the deck name, Display Name doesn't have to be unique.

By default, name and Display Name will be the same until setDisplayName is used.

### flashcards.getDisplayName()
Returns the currently open deck's Display Name (as string).

### flashcards.getDeckLength()
Returns an integer representing the number of cards in the currently-open deck.

### flashcards.listDecks()
Returns an array with an object representing each deck in localStorage, containing 'name' and 'displayName' values for each deck.

### flashcards.exposeDeck()
Returns an object representing the current deck. Useful if you're trying to find the index of a specific card in the 'cards' object, as _flashcards.exposeDeck().cards_
