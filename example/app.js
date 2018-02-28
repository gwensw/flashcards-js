/*jshint esversion:6, devel: true, browser: true*/

(function () {
  
  // generate an extra deck upon page load
  // populate homepage with decks using 'listDecks' function + handlebars templating
  // have each deck link to training mode
  // new feature for flashcards - it should be possible to give a deck a long-form name under settings
  
  /* SETUP - SHARED VARIABLES */
  
  //get handlebars templates
  function getTemplate (name) {
    return Handlebars.compile(document.getElementById(name).innerHTML);
  }
  const headerTemplate = getTemplate("headerTemplate"),
        trainTemplate = getTemplate("trainTemplate"),
        selectTemplate = getTemplate("selectTemplate"),
        questionTemplate = getTemplate("questionTemplate"),
        answerTemplate = getTemplate("answerTemplate"),
        progressTemplate = getTemplate("progressTemplate"),
        scoreTemplate = getTemplate("scoreTemplate");
  
  //variables for retrying wrong answers
  let cardsToRetry = 0,
      retryIndexes = [];
  
  /* SET UP ROUTING */
  
  //create a sample deck with some cards (if not already in localstorage)
  flashcards.openDeck('food');
  if (!flashcards.deckLength()) {
    flashcards.addCards(['milk', 'llaeth'], ['bread', 'bara'], ['soup', 'cawl'], ['butter', 'menyn'], ['cheese', 'caws'], ['tasty', 'blasus'], ['healthy', 'iachus'], ['chocolate', 'siocled'], ['carrots', 'moron'], ['beans', 'ffa'], ['toast', 'tost'], ['tomatoes', 'tomatos'], ['salt', 'halen'], ['salty', 'hallt'], ['pepper', ['pubr', 'pubur']], ['coffee', 'coffi']);
  }
  //set up routing
  const routes = {
    '/train/:deckname': train,
    '/edit/:deckname': edit,
    '/': select,
  };
  
  /* FUNCTIONS FOR ROUTING */
  
  function train(name) {
    
    // make necessary rendering changes to homepage
    document.querySelector(".main").innerHTML = trainTemplate();
    changeHeader(true, name);
    
    //open and render deck
    flashcards.openDeck(name);
    drawNextCard();
    console.log("Opened", name);
    
    //bind event listeners
    document.getElementById('shuffle').addEventListener('click', () => {
      cardsToRetry = 0;
      retryIndexes = [];
      Render.reset();
      flashcards.shuffle();
      drawNextCard();
    });

    document.getElementById('checkAnswer').addEventListener('click', () => {
      submitAnswer();
    });

    document.getElementById('nextCard').addEventListener('click', () => {
      drawNextCard();
    });

    //start again with only wrong cards displayed
    document.getElementById('retry').addEventListener('click', () => {
      cardsToRetry = flashcards.getSessionInfo().incorrect;
      retryIndexes = flashcards.getSessionInfo().incorrectCards;
      Render.reset();
      flashcards.openDeck('food');
      drawNextCard();
    });
    
  }
  
  function edit(name) {
    console.log("Editing", name);
    //TODO: interface for editing / creating new decks
  }
  
  function select() {
    console.log("Looking at", localStorage.length, localStorage.key(0));
    document.querySelector(".main").innerHTML = selectTemplate();
    changeHeader(false, "Flashcards.js");
  }
  
  /* HELPER FUNCTIONS FOR EVENT LISTENERS */
  
  function drawNextCard () {
    let card = cardsToRetry ? flashcards.draw(retryIndexes.splice(0, 1)[0]) : flashcards.drawNext();
    if (!card) {
      Render.score(flashcards.getSessionInfo());
    } else {
      Render.question(card.question[0], card.difficulty);
      document.querySelector('.answer__input').addEventListener('keydown', enterAnswer);
      Render.progress(flashcards.getSessionInfo(), flashcards.deckLength());
    }
  }
  
  function submitAnswer () {
    let userAnswer = document.querySelector('.answer__input'),
        result = flashcards.checkAnswer(userAnswer.value);
    Render.answer(result.answers, result.newDifficulty, result.outcome);
    Render.progress(flashcards.getSessionInfo(), flashcards.deckLength());
    userAnswer.removeEventListener('keydown', enterAnswer);
  }
      
  function enterAnswer (event) {
    if (event.keyCode === 13) {
      event.preventDefault();
      submitAnswer();
    }
  }
  
  function changeHeader (backlink, title) {
    let context = {
      backlink: backlink,
      title: title
    };
    document.querySelector(".header").innerHTML = headerTemplate(context);
  }

  /* FUNCTIONS FOR RENDERING */
  
  const Render = {
    
    question: function (qText, diff) {
      let context = {
        question: qText,
        difficulty: diff
      },
          userAnswer = document.querySelector('.answer__input');
      document.querySelector('.card__side--question').innerHTML = questionTemplate(context);
      document.querySelector('#maincard').classList.remove('card--flip');
      userAnswer.value = '';
      userAnswer.readOnly = false;
      userAnswer.focus();
      document.getElementById('checkAnswer').classList.remove('js-hidden');
      document.getElementById('nextCard').classList.add('js-hidden');
    },
    
    answer: function (answers, newDiff, outcome) {
      let context = {
        answers: answers,
        difficulty: newDiff,
        outcome: outcome
      },
          nextButton = document.getElementById('nextCard');
      document.querySelector('.card__side--answer').innerHTML = answerTemplate(context);
      
      //flip card
      document.querySelector('#maincard').classList.add('card--flip');
      
      //turn button to 'next' button
      document.getElementById('checkAnswer').classList.add('js-hidden');
      nextButton.classList.remove('js-hidden');
      
      //freeze/disable input and focus on 'next' button
      document.querySelector('.answer__input').readOnly = true;
      nextButton.focus();
    },
    
    progress: function (sessionInfo, totalCards) {
      let bars = [],
          cardsAnswered = sessionInfo.correct + sessionInfo.incorrect,
          cardsRemaining = cardsToRetry ? cardsToRetry - cardsAnswered : totalCards - cardsAnswered,
          i;
      for (i = 0; i < totalCards; i++) {
        if (sessionInfo.correctCards.includes(i)) {
          bars.push('correct');
        } else if (sessionInfo.incorrectCards.includes(i)) {
          bars.push('incorrect');
        }
      }
      for (i = 0; i < cardsRemaining; i++) {
        bars.push('incomplete');
      }
      document.querySelector('.progress').innerHTML = progressTemplate( {bars: bars} );
    },
    
    score: function (sessionInfo) {
      let context = {
        correct: sessionInfo.correct,
        total: sessionInfo.incorrect + sessionInfo.correct
      },
          retryButton = document.getElementById('retry'),
          scoreIndicator = document.querySelector('.score');
      scoreIndicator.innerHTML = scoreTemplate(context);
      scoreIndicator.classList.remove('js-hidden');
      document.querySelector('.card').classList.add('js-hidden');
      document.querySelector('.answer__input').classList.add('js-hidden');
      document.getElementById('nextCard').classList.add('js-hidden');
      if (sessionInfo.incorrect) {
        retryButton.classList.remove('js-hidden');
        retryButton.focus();
      } else {
        document.getElementById('shuffle').focus();
      }
    },
    
    reset: function () {
      document.querySelector('.card').classList.remove('js-hidden');
      document.querySelector('.answer__input').classList.remove('js-hidden');
      document.getElementById('retry').classList.add('js-hidden');
      document.querySelector('.score').classList.add('js-hidden');
    }
    
  };
  
  Router(routes).init();

})();
