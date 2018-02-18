/*jshint esversion:6, devel: true, browser: true*/

(function () {
  
  /* SETUP - SHARED VARIABLES */
  
  //get DOM elements
  const card = document.querySelector('.card'),
        difficultyIndicator = document.querySelector('.card__difficulty'),
        userAnswer = document.querySelector('.answer__input'),
        shuffleButton = document.getElementById('shuffle'),
        submitButton = document.getElementById('checkAnswer'),
        nextButton = document.getElementById('nextCard'),
        progressBar = document.querySelector('.progress');
  
  //get handlebars templates
  const questionTemplate = Handlebars.compile(document.getElementById("questionTemplate").innerHTML),
        answerTemplate = Handlebars.compile(document.getElementById("answerTemplate").innerHTML),
        progressTemplate = Handlebars.compile(document.getElementById("progressTemplate").innerHTML);

  
  //keep track of score
  let correct = 0,
      incorrect = 0,
      tally = [];
  
  /* HELPER FUNCTIONS FOR HANDLERS */
  
  function drawNextCard () {
    let card = flashcards.drawNext();
    Render.question(card.question[0], card.difficulty);
  };
        
  /* BIND EVENT LISTENERS */
  
  document.addEventListener('DOMContentLoaded', () => {
    //create a sample deck with some cards (if not already in localstorage)
    flashcards.openDeck('food');
    if (!flashcards.deckLength()) {
      flashcards.addCards(['milk', 'llaeth'], ['bread', 'bara'], ['soup', 'cawl'], ['butter', 'menyn'], ['cheese', 'caws'], ['tasty', 'blasus'], ['healthy', 'iachus'], ['chocolate', 'siocled'], ['carrots', 'moron'], ['beans', 'ffa'], ['baked beans', 'ffa pôb'], ['toast', 'tost'], ['tomatoes', 'tomatos'], ['salt', 'halen'], ['salty', 'hallt'], ['pepper', ['pubr', 'pubur']], ['coffee', 'coffi'], ['tea', 'tê']);
    }
    //draw then render the first card
    drawNextCard();
    Render.progress(flashcards.deckLength());
  });
  
  shuffleButton.addEventListener('click', () => {
    flashcards.shuffle();
    drawNextCard();
    //reset scoring
    correct = 0;
    incorrect = 0;
    tally = [];
    Render.progress(flashcards.deckLength());
  });
  
  submitButton.addEventListener('click', () => {
    let result = flashcards.checkAnswer(userAnswer.value);
    if (result.outcome) {
      correct += 1;
      tally.push("correct");
    } else {
      incorrect += 1;
      tally.push("incorrect");
    }
    Render.answer(result.answers, result.newDifficulty, result.outcome);
    Render.progress(flashcards.deckLength());
  });
  
  nextButton.addEventListener('click', () => {
    drawNextCard();
  });
  
  /* FUNCTIONS FOR RENDERING */
  
  const Render = {
    
    question: function (qText, diff) {
      let context = {
        question: qText,
        difficulty: diff
      };
      card.innerHTML = questionTemplate(context);
      userAnswer.value = '';
      submitButton.classList.remove('js-hidden');
      nextButton.classList.add('js-hidden');
    },
    
    answer: function (answers, newDiff, outcome) {
      let context = {
        answers: answers,
        difficulty: newDiff,
        outcome: outcome
      };
      card.innerHTML = answerTemplate(context);
      
      //turn button to 'next' button
      submitButton.classList.add('js-hidden');
      nextButton.classList.remove('js-hidden');
      
      //freeze/disable input and focus on 'next' button
      
    },
    
    progress: function (totalCards) {
      let bars = tally.slice(),
          i,
          context;
      for (i = 0; i < (totalCards - tally.length); i++) {
        bars.push('incomplete');
      }
      context = {
        bars: bars
      };
      progressBar.innerHTML = progressTemplate(context);
    },
    
    score: function (cardsCorrect, cardsIncorrect) {
      
    }
    
  }

})();
