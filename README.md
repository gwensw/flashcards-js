# Flashcards.js

## Example

See an example app built on this library at: https://benwig.github.io/flashcards-example/index.html

## Basic Methods

### flashcards.openDeck(_name_)
Creates a new deck, or opens an existing deck of that name. Every action from now on will affect the open deck.

### flashcards.addCard(_side1, side2, difficulty_)
Adds a new card to the current deck, specifying what text should appear on either side.

_Side1_ is the default 'question' side. _Side2_ is the default 'answer' side.
_Difficulty_ is optional, and should be an integer between 0 and 10. It defaults to 5.

### flashcards.addCards(_array_, ...)
Adds multiple cards to the current deck. Information for each card should be in an array.

Cards can have multiple possible answers on each side. See 'basic example code' below.

### flashcards.drawNext(_min, max_)
Each time it's used, it draws the next card from the deck.

Returns an object representing the card with 'question' as array and 'difficulty' as integer.

Only returns cards whose difficulty are between the optional _min_ and _max_ integers. If only _min_ is given, return any cards from _min_ to 10.

### flashcards.checkAnswer(attempt)
Accepts an attempt for the current card, and checks it against the card's array of possible correct answers.
If incorrect, card's difficulty will increase +1 (up to a limit of 10). If correct, card's difficulty will decrease -1 (down to a limit of 0).

Returns an object with 'outcome' (bool), 'newDifficulty' (integer) and 'answers' (array of all possible answers).

Note that this changes the difficulty of the card each time it's called, so only call it for actual attempts!

### flashcards.shuffle()
Randomly re-orders the cards in the current deck. drawNext() will now start from card index 0.

## Example Code

See the tests for more examples.

```javascript
// create/open a deck.
flashcards.openDeck('testdeck');

// add one card.
flashcards.addCard('What is the capital of the UK?', 'London', 2);

// add multiple cards. Second card has two possible answers.
flashcards.addCards(['2 + 2?', '4', 1], ['Tallest mountain on earth?', ['Everest', 'Chomolungma'], 3]);

// shuffle the deck to randomly re-order the cards.
flashcards.shuffle();

// draw the first card from the deck. Returns an object with 'question' as array and 'difficulty' as integer.
// Returns false if no cards in deck or all cards have been drawn.
var currentCard = flashcards.drawNext();
currentCard.question //['2 + 2?']
currentCard.difficulty //1

// Pass in an attempt for the current card, and get the outcome.
// If false, card's difficulty will increase +1
// If correct, difficulty will decrease -1
// Function returns an object with 'outcome' (bool), 'newDifficulty' (integer) and 'answers' (array of all possible answers).
var myTry = flashcards.checkAnswer('5');
myTry.outcome //false
myTry.newDifficulty //2
myTry.answers //['4']

```

## Further Methods

### flashcards.flipDeck()
Swaps which sides of the card are used for question and answer.

### flashcards.exposeDeck()
Returns an object representing the current deck. Useful for finding the index of cards in the 'cards' object, as _flashcards.exposeDeck().cards_

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