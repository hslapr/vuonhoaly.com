questions = [
  {
    "question": "Writing a new spreadsheet or word-processing program these days is a ______ process, like building a skyscraper out of toothpicks.",
    "hint": "long, slow, dull",
    "answer": "tedious"
  },
  {
    "question": "Her recent expressions of concern are self-serving and _______.",
    "hint": "giving a false appearance",
    "answer": "disingenuous"
  }
];
const maxTry = 6;

const eQuestion = document.getElementById("question");
const eHint = document.getElementById("hint");
const eResult = document.getElementById("result");
const iAnswer = document.getElementById("answer");
const board = document.getElementById("board");
const btnSubmit = document.getElementById("submit");
const divAnswer = document.getElementById("div-answer");
const share = document.getElementById("share");
const divShare = document.getElementById("div-share");

const evaluation = ["absent", "present", "correct"];
const emoji = ["⬜️", "🟨", "🟩", "🟦"];

