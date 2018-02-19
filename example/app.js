/*jshint esversion:6, devel: true, browser: true*/

(function () {
  
  /* SETUP - SHARED VARIABLES */
  
  //get DOM elements
  const cardStack = document.querySelector('.card'),
        mainCard = document.querySelector('#maincard'),
        cardQuestion = document.querySelector('.card__side--question'),
        cardAnswer = document.querySelector('.card__side--answer'),
        difficultyIndicator = document.querySelector('.card__difficulty'),
        userAnswer = document.querySelector('.answer__input'),
        shuffleButton = document.getElementById('shuffle'),
        retryButton = document.getElementById('retry'),
        submitButton = document.getElementById('checkAnswer'),
        nextButton = document.getElementById('nextCard'),
        progressBar = document.querySelector('.progress'),
        score = document.querySelector('.score');
  
  //get handlebars templates
  const questionTemplate = Handlebars.compile(document.getElementById("questionTemplate").innerHTML),
        answerTemplate = Handlebars.compile(document.getElementById("answerTemplate").innerHTML),
        progressTemplate = Handlebars.compile(document.getElementById("progressTemplate").innerHTML),
        scoreTemplate = Handlebars.compile(document.getElementById("scoreTemplate").innerHTML);
  
  //variables for retrying wrong answers
  let cardsToRetry = 0,
      retryIndexes = [];
  
  /* HELPER FUNCTIONS FOR EVENT LISTENERS */
  
  function drawNextCard () {
    let card = cardsToRetry ? flashcards.draw(retryIndexes.splice(0, 1)[0]) : flashcards.drawNext();
    if (!card) {
      Render.score(flashcards.getSessionInfo());
    } else {
      Render.question(card.question[0], card.difficulty);
      userAnswer.addEventListener('keydown', enterAnswer);
      Render.progress(flashcards.getSessionInfo(), flashcards.deckLength());
    }
  }
  
  function submitAnswer () {
    let result = flashcards.checkAnswer(userAnswer.value);
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
        
  /* BIND EVENT LISTENERS */
  
  document.addEventListener('DOMContentLoaded', () => {
    //create a sample deck with some cards (if not already in localstorage)
    flashcards.openDeck('food');
    if (!flashcards.deckLength()) {
      flashcards.addCards(['milk', 'llaeth'], ['bread', 'bara'], ['soup', 'cawl'], ['butter', 'menyn'], ['cheese', 'caws'], ['tasty', 'blasus'], ['healthy', 'iachus'], ['chocolate', 'siocled'], ['carrots', 'moron'], ['beans', 'ffa'], ['toast', 'tost'], ['tomatoes', 'tomatos'], ['salt', 'halen'], ['salty', 'hallt'], ['pepper', ['pubr', 'pubur']], ['coffee', 'coffi']);
    }
    //draw then render the first card
    drawNextCard();
  });
  
  shuffleButton.addEventListener('click', () => {
    cardsToRetry = 0;
    retryIndexes = [];
    Render.reset();
    flashcards.shuffle();
    drawNextCard();
  });
  
  submitButton.addEventListener('click', () => {
    submitAnswer();
  });
  
  nextButton.addEventListener('click', () => {
    drawNextCard();
  });
  
  //start again with only wrong cards displayed
  retryButton.addEventListener('click', () => {
    cardsToRetry = flashcards.getSessionInfo().incorrect;
    retryIndexes = flashcards.getSessionInfo().incorrectCards;
    Render.reset();
    flashcards.openDeck('food');
    drawNextCard();
  });
  
  /* FUNCTIONS FOR RENDERING */
  
  const Render = {
    
    question: function (qText, diff) {
      let context = {
        question: qText,
        difficulty: diff
      };
      cardQuestion.innerHTML = questionTemplate(context);
      mainCard.classList.remove('card--flip');
      userAnswer.value = '';
      userAnswer.readOnly = false;
      userAnswer.focus();
      submitButton.classList.remove('js-hidden');
      nextButton.classList.add('js-hidden');
    },
    
    answer: function (answers, newDiff, outcome) {
      let context = {
        answers: answers,
        difficulty: newDiff,
        outcome: outcome
      };
      cardAnswer.innerHTML = answerTemplate(context);
      
      //flip card
      mainCard.classList.add('card--flip');
      
      //turn button to 'next' button
      submitButton.classList.add('js-hidden');
      nextButton.classList.remove('js-hidden');
      
      //freeze/disable input and focus on 'next' button
      userAnswer.readOnly = true;
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
      progressBar.innerHTML = progressTemplate( {bars: bars} );
    },
    
    score: function (sessionInfo) {
      let context = {
        correct: sessionInfo.correct,
        total: sessionInfo.incorrect + sessionInfo.correct
      };
      score.innerHTML = scoreTemplate(context);
      score.classList.remove('js-hidden');
      cardStack.classList.add('js-hidden');
      userAnswer.classList.add('js-hidden');
      nextButton.classList.add('js-hidden');
      if (sessionInfo.incorrect) {
        retryButton.classList.remove('js-hidden');
        retryButton.focus();
      } else {
        shuffleButton.focus();
      }
    },
    
    reset: function () {
      cardStack.classList.remove('js-hidden');
      userAnswer.classList.remove('js-hidden');
      retryButton.classList.add('js-hidden');
      score.classList.add('js-hidden');
    }
    
  };

})();
