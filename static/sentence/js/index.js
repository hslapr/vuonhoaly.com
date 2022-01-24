// const re = new RegExp('([a-zA-ZäöüÄÖÜß]+-[a-zA-ZäöüÄÖÜß]+|[a-zA-ZäöüÄÖÜß]+)', 'g');
const re = new RegExp('([a-zA-ZÀ-ÖØ-öø-ƿǄ-ʸ]+[a-zA-ZÀ-ÖØ-öø-ƿǄ-ʸ-]+|[a-zA-ZÀ-ÖØ-öø-ƿǄ-ʸ]+)', 'g');

// const re = new RegExp('([\p{Letter}]+[\p{Letter}-]*)', 'gu');

var sentences = [];
var currentSentenceIndex = 0;
var spanCnt;
var spans = [];
var spanIndexArray = [];
var spanIndexArrayIndex = 0;

var body = document.getElementsByTagName("body")[0];
var pSentence = document.getElementById("sentence");
var spanCurrentSentenceIndex = document.getElementById("current-sentence-index");
var spanSentenceCnt = document.getElementById("sentence-cnt");
var btnNext = document.getElementById("btn-next");
var btnPrev = document.getElementById("btn-prev");
var btnAgain = document.getElementById("btn-again");
var btnCheck = document.getElementById("btn-check");
var inputBlankCnt = document.getElementById("input-blank-cnt");


body.ondrop = function(e) {
  e.preventDefault();
  console.log(e);
  if (e.dataTransfer.items) {
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      if (e.dataTransfer.items[i].kind === 'file') {
        let file = e.dataTransfer.items[i].getAsFile();
        loadFile(file);
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      loadFile(e.dataTransfer.files[i]);
    }
  }
};

body.ondragover = function(e) {
  e.preventDefault();
};

function loadFile(file) {
  if (file.type.includes('text')) {
    let reader = new FileReader();
    reader.onload = function(e) {
      let lines = reader.result.replace(/[\r]/g, "").split("\n");
      let sentence = "";
      let multiline = false;
      let isSentence = true;
      for (let line of lines) {
        if (isSentence) {
          if (multiline) {
            if (line.endsWith("\\")) {
              line = line.substr(0, line.length - 1);
              sentence += line + "\n";
            } else {
              sentence += line;
              multiline = false;
              isSentence = false;
              sentences.push(sentence);
            }
          } else {
            if (line.endsWith("\\")) {
              line = line.substr(0, line.length - 1);
              sentence = line + "\n";
              multiline = true;
            } else {
              sentence = line;
              isSentence = false;
              sentences.push(sentence);
            }
          }
        } else if (line.length < 1) {
          isSentence = true;
        }
      }
      spanSentenceCnt.innerText = sentences.length;
      currentSentenceIndex = 0;
      if (sentences.length > 1) {
        btnNext.removeAttribute("disabled");
      }
      btnAgain.removeAttribute("disabled");
      btnCheck.removeAttribute("disabled");
      spanCurrentSentenceIndex.innerText = currentSentenceIndex + 1;
      showSentence();
    }
    reader.readAsText(file);
  }
}

function changeSentence(d) {
  currentSentenceIndex += d;
  if (currentSentenceIndex >= sentences.length - 1) {
    btnNext.disabled = "disabled";
  } else {
    btnNext.removeAttribute("disabled");
  }
  if (currentSentenceIndex <= 0) {
    btnPrev.disabled = "disabled";
  }
  else {
    btnPrev.removeAttribute("disabled");
  }
  spanCurrentSentenceIndex.innerText = currentSentenceIndex + 1;
  showSentence();
}

btnNext.onclick = function(e) {
  e.preventDefault();
  changeSentence(1);
}

btnPrev.onclick = function(e) {
  e.preventDefault();
  changeSentence(-1);
}

btnAgain.onclick = function(e) {
  e.preventDefault();
  showSentenceAgain();
}

btnCheck.onclick = function(e) {
  e.preventDefault();
  check();
}

function check() {
  let blanks = document.querySelectorAll("input.blank");
  for (const blank of blanks) {
    let blankIndex = getBlankIndex(blank);
    let ans = spans[blankIndex].innerText;
    if (blank.value == ans) {
      blank.classList.remove("wrong");
      blank.classList.add("correct");
    } else {
      blank.classList.remove("correct");
      blank.classList.add("wrong");
    }
  }
}


function showSentence() {
  spans = [];
  pSentence.innerHTML = "";
  let sentence = sentences[currentSentenceIndex];
  let match;
  let i = 0;
  let spanIndex = 0;
  while ((match = re.exec(sentence)) !== null) {
    appendText(sentence.substr(i, match.index - i), pSentence);
    let span = document.createElement('span');
    span.id = "span-" + spanIndex;
    spanIndex++;
    span.innerText = match[0];
    pSentence.append(span);
    spans.push(span);
    i = re.lastIndex;
  }
  pSentence.append(sentence.substring(i, sentence.length));
  spanCnt = spanIndex;
  inputBlankCnt.max = spanCnt;
  initSpanIndexArray();
  // TODO
  let blankCnt = parseInt(inputBlankCnt.value);
  if (blankCnt > spanCnt) {
    blankCnt = spanCnt;
    inputBlankCnt.value = spanCnt;
  }
  shuffle(spanIndexArray);
  spanIndexArrayIndex = 0;
  for (let i = spanIndexArrayIndex; i < spanIndexArrayIndex + blankCnt; i++) {
    createBlank(spanIndexArray[i]);
  }
  spanIndexArrayIndex += blankCnt;
}

function showSentenceAgain(){
  let blanks = document.querySelectorAll("input.blank");
  for (const blank of blanks) {
    let blankIndex = getBlankIndex(blank);
    pSentence.insertBefore(spans[blankIndex], blank);
    // spans[blankIndex].style.display = "inline";
    blank.remove();
  }
  let blankCnt = parseInt(inputBlankCnt.value);
  if (spanIndexArrayIndex + blankCnt >= spanCnt) {
    shuffle(spanIndexArray);
    spanIndexArrayIndex = 0;
  }
  for (let i = spanIndexArrayIndex; i < spanIndexArrayIndex + blankCnt; i++) {
    createBlank(spanIndexArray[i]);
  }
  spanIndexArrayIndex += blankCnt;
}

function getBlankIndex(blank) {
  return parseInt(blank.id.split("-")[1]);
}

function blankKeydownHandler(e) {
  if (e.ctrlKey && e.keyCode == 13) {
    check();
  }
}

function initSpanIndexArray() {
  spanIndexArray = [];
  for (let i = 0; i < spanCnt; i++) {
    spanIndexArray.push(i);
  }
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function appendText(t, element) {
  let i = t.indexOf("\n");
  if (i < 0) {
    element.append(t);
  } else {
    element.append(t.substring(0, i));
    element.append(document.createElement('br'));
    element.append(t.substring(i, t.length));
  }
}

function createBlank(spanIndex) {
  console.log("createBlank: "+ spanIndex);
  if (spanIndex >= spanCnt) return;
  let span = spans[spanIndex];
  let input = document.createElement("input");
  input.type = "text";
  input.size = span.innerText.length;
  input.classList.add("blank");
  input.id = "blank-" + spanIndex;
  input.onkeydown = blankKeydownHandler;
  pSentence.insertBefore(input, span);
  pSentence.removeChild(span);
}



document.onload = function() {





}