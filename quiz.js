(function () {
  "use strict";

  const QUIZ_LENGTH = 20;
  const MODE_EN_ZH = "en-zh";
  const MODE_ZH_EN = "zh-en";

  const loadStatusEl = document.getElementById("load-status");
  const modeEnZhBtn = document.getElementById("mode-en-zh");
  const modeZhEnBtn = document.getElementById("mode-zh-en");
  const quizPanel = document.getElementById("quiz-panel");
  const resultPanel = document.getElementById("result-panel");
  const progressEl = document.getElementById("progress");
  const questionTextEl = document.getElementById("question-text");
  const hintTextEl = document.getElementById("hint-text");
  const optionsContainer = document.getElementById("options-container");
  const inputContainer = document.getElementById("input-container");
  const answerInput = document.getElementById("answer-input");
  const submitAnswerBtn = document.getElementById("submit-answer");
  const feedbackEl = document.getElementById("feedback");
  const nextQuestionBtn = document.getElementById("next-question");
  const finalScoreEl = document.getElementById("final-score");
  const restartQuizBtn = document.getElementById("restart-quiz");

  let vocabulary = [];
  let questions = [];
  let mode = "";
  let currentIndex = 0;
  let score = 0;
  let answered = false;

  function shuffle(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function pickRandomEntries(data, count) {
    return shuffle(data).slice(0, Math.min(count, data.length));
  }

  function resetPanels() {
    quizPanel.classList.add("hidden");
    resultPanel.classList.add("hidden");
    feedbackEl.classList.add("hidden");
    nextQuestionBtn.classList.add("hidden");
  }

  function setDataError(message) {
    loadStatusEl.textContent = message;
    loadStatusEl.style.color = "#991b1b";
    modeEnZhBtn.disabled = true;
    modeZhEnBtn.disabled = true;
  }

  function renderQuestion() {
    const question = questions[currentIndex];
    answered = false;

    progressEl.textContent = `Question ${currentIndex + 1} / ${questions.length} | Score: ${score}`;
    questionTextEl.textContent = question.prompt;
    hintTextEl.textContent = question.hint || "";
    feedbackEl.className = "status hidden";
    feedbackEl.textContent = "";
    nextQuestionBtn.classList.add("hidden");

    if (mode === MODE_EN_ZH) {
      optionsContainer.classList.remove("hidden");
      inputContainer.classList.add("hidden");
      optionsContainer.innerHTML = "";

      question.options.forEach(function (option) {
        const btn = document.createElement("button");
        btn.className = "button option-btn";
        btn.textContent = option;
        btn.addEventListener("click", function () {
          checkAnswer(option);
        });
        optionsContainer.appendChild(btn);
      });
      return;
    }

    optionsContainer.classList.add("hidden");
    inputContainer.classList.remove("hidden");
    answerInput.value = "";
    answerInput.focus();
  }

  function lockQuestionUI() {
    answered = true;
    const optionButtons = optionsContainer.querySelectorAll("button");
    optionButtons.forEach(function (btn) {
      btn.disabled = true;
    });
    submitAnswerBtn.disabled = true;
    nextQuestionBtn.classList.remove("hidden");
  }

  function showFeedback(correct, message) {
    feedbackEl.textContent = message;
    feedbackEl.className = correct ? "status correct" : "status wrong";
  }

  function checkAnswer(userAnswer) {
    if (answered) {
      return;
    }

    const question = questions[currentIndex];
    const normalizedUser = String(userAnswer || "").trim().toLowerCase();
    const normalizedRight = question.answer.trim().toLowerCase();
    const correct = normalizedUser === normalizedRight;

    if (correct) {
      score += 1;
      showFeedback(true, "Correct.");
    } else {
      showFeedback(false, `Incorrect. Correct answer: ${question.answer}`);
    }

    lockQuestionUI();
  }

  function buildEnZhQuestions(entries) {
    return entries.map(function (entry) {
      const distractorPool = shuffle(vocabulary)
        .map(function (item) {
          return item.meaning;
        })
        .filter(function (meaning) {
          return meaning !== entry.meaning;
        })
        .filter(function (meaning, index, all) {
          return all.indexOf(meaning) === index;
        })
        .slice(0, 3);

      const distractors = distractorPool;
      const options = shuffle([entry.meaning].concat(distractors));
      return {
        prompt: entry.word,
        answer: entry.meaning,
        options: options
      };
    });
  }

  function buildZhEnQuestions(entries) {
    return entries.map(function (entry) {
      return {
        prompt: entry.meaning,
        answer: entry.word,
        hint: `Hint: ${entry.word.length} letters`
      };
    });
  }

  function startQuiz(selectedMode) {
    if (!vocabulary.length) {
      return;
    }

    mode = selectedMode;
    currentIndex = 0;
    score = 0;
    submitAnswerBtn.disabled = false;
    resetPanels();
    quizPanel.classList.remove("hidden");

    const selectedEntries = pickRandomEntries(vocabulary, QUIZ_LENGTH);
    questions =
      mode === MODE_EN_ZH
        ? buildEnZhQuestions(selectedEntries)
        : buildZhEnQuestions(selectedEntries);

    renderQuestion();
  }

  function moveToNextQuestion() {
    currentIndex += 1;
    submitAnswerBtn.disabled = false;

    if (currentIndex >= questions.length) {
      quizPanel.classList.add("hidden");
      resultPanel.classList.remove("hidden");
      finalScoreEl.textContent = `Your final score: ${score} / ${questions.length}`;
      return;
    }

    renderQuestion();
  }

  function restartQuiz() {
    resetPanels();
    loadStatusEl.textContent = "Choose a mode to start.";
    loadStatusEl.style.color = "#475569";
    mode = "";
    questions = [];
  }

  modeEnZhBtn.addEventListener("click", function () {
    startQuiz(MODE_EN_ZH);
  });

  modeZhEnBtn.addEventListener("click", function () {
    startQuiz(MODE_ZH_EN);
  });

  submitAnswerBtn.addEventListener("click", function () {
    checkAnswer(answerInput.value);
  });

  answerInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter" && !answered) {
      checkAnswer(answerInput.value);
    }
  });

  nextQuestionBtn.addEventListener("click", moveToNextQuestion);
  restartQuizBtn.addEventListener("click", restartQuiz);

  fetch("./data/vocabulary.json")
    .then(function (response) {
      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      if (!Array.isArray(data) || data.length < QUIZ_LENGTH) {
        throw new Error("Vocabulary data is invalid or too small.");
      }

      vocabulary = data.filter(function (item) {
        return item && item.word && item.meaning;
      });

      if (vocabulary.length < QUIZ_LENGTH) {
        throw new Error("Vocabulary entries are insufficient after validation.");
      }

      loadStatusEl.textContent = `Vocabulary loaded (${vocabulary.length} entries). Choose a mode to start.`;
      loadStatusEl.style.color = "#475569";
    })
    .catch(function (error) {
      setDataError("Failed to load vocabulary data. Please refresh and try again.");
      console.error(error);
    });
})();
