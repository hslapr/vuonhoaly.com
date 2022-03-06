var questionIndex = Math.round((new Date().setHours(0,0,0,0) - new Date(2022,2,6,0,0,0,0))/864e5);
var questionToday = questions[questionIndex];
eQuestion.textContent = questionToday.question;
eHint.append(questionToday.hint);
var divTiles = null;
var record = [];

var nTry = 0;
btnSubmit.onclick = check;
answer.onkeydown = function(event){
  if (event.key === 'Enter') check();
}

function newTry() {
  nTry++;
  // let div = document.createElement("div");
  // div.id = "div-answer-" + nTry;
  // let label = document.createElement("label");
  // label.for = "answer";
  // label.textContent = String(nTry) + ". Your answer: ";
  // let input = document.createElement("input");
  // input.type = "text";
  // input.id = "answer";
  // let btn = document.createElement("button");
  // btn.type = "button";
  // btn.id = "btn-answer";
  // btn.textContent = "Submit";
  // btn.onclick = check;
  // div.append(label);
  // div.append(input);
  // div.append(btn);
  // divAnswer.append(div);
  iAnswer.value = "";
}

function check() {
  let ans = iAnswer.value.toLowerCase();
  divTiles = document.createElement("div");
  board.append(divTiles);
  record.push([]);
  for (let i = 0; i < ans.length; i++) {
    const c = ans[i];
    if (i < questionToday.answer.length && c == questionToday.answer[i]) {
      record[nTry].push(2);
      createTile(c, 2);
    } else if (questionToday.answer.indexOf(c) > -1) {
      record[nTry].push(1);
      createTile(c, 1);
    } else {
      record[nTry].push(0);
      createTile(c, 0);
    }
  }
  if (ans.length < questionToday.answer.length && questionToday.answer.startsWith(ans)) {
    record[nTry].push(3);
  }
  if (ans == questionToday.answer) {
    gameOver(true);
  } else if (nTry >= maxTry) {
    gameOver(false);
  } else {
    newTry();
  }
}

function gameOver(win) {
  eResult.hidden = false;
  if (win) {
    eResult.textContent = "Congratulations!";
  } else {
    eResult.textContent = "The answer is " + questionToday.answer + ".";
  }
  divAnswer.remove();
  generateShareContent();
}

function generateShareContent() {
  let s = "";
  for (const line of record) {
    for (const i of line) {
      s += emoji[i];
    }
    s += '%0A';
  }
  s += "&url=https%3A%2F%2Fwww.vuonhoaly.com%2Fvordle%2F"
  share.href = "https://twitter.com/intent/tweet?text=" + s;
  divShare.hidden = false;
}

function createTile(letter, i) {
  let tile = document.createElement("div");
  tile.classList.add("tile");
  tile.textContent = letter;
  tile.classList.add(evaluation[i]);
  divTiles.append(tile);

}