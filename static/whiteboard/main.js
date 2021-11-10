
var span_i = 0;
var image_i = 0;
const settingsForm = document.getElementById('settings-form');
const imageWidthLabel = document.getElementById('image-width-label');
const imageWidth = document.getElementById('image-width');
const highlightIcon = document.getElementById('highlight-icon');
const mathIcon = document.getElementById('math-icon');
const trashCan = document.getElementById('trash-can');
const fileDropZone = document.getElementById('file-drop-zone');
const fontSizeIcon = document.getElementById('font-size-icon');
const fontFamilyIcon = document.getElementById('font-family-icon');
const fontSizeSelect = document.getElementById('font-size-select');
const fontFamilySelect = document.getElementById('font-family-select');
const colorLabels = document.getElementsByClassName('color-label');

container.style.height = window.innerHeight + 'px';

function preventDefaultHandler(e) {
  e.preventDefault();
}


container.addEventListener('click', function(e) {
  for (let element of document.getElementsByName('i')) {
    container.removeChild(element);
  }
  //if (e.target !== this) return;
  const input = document.createElement('input');
  input.type = 'text';
  input.style.position = 'absolute';
  input.style.top = e.pageY  + 'px';
  input.style.left = e.pageX + 'px';
  input.size = 20;
  input.name = 'i';
  container.appendChild(input);
  input.focus();
  input.addEventListener('keypress', function(e) {
    if (e.key == 'Enter') {
      if (this.value.length > 0) {
        const span = document.createElement('span');
        span.id = 'span-' + span_i.toString(36);
        span_i++;
        span.textContent = this.value;
        span.draggable = true;
        span.style.position = this.style.position;
        span.style.top = this.style.top;
        span.style.left = this.style.left;
        span.style.fontSize = fontSizeSelect.value;
        span.style.fontFamily = fontFamilySelect.value;
        let data = new FormData(settingsForm);
        span.style.color = data.get('color');
        container.appendChild(span);
      }
      container.removeChild(this);
    }
  }, true);
}, true);


container.addEventListener('mousemove', function (e) {
  if (e.ctrlKey) {
    this.style.cursor = 'url(cursor.cur) 5 5, pointer';
  } else {
    this.style.cursor = 'auto';
  }
}, true);

fontSizeIcon.ondragstart = function(e) {
  e.dataTransfer.setData("text/plain", 'set font-size');
  e.dataTransfer.effectAllowed = "move";
};

fontFamilyIcon.ondragstart = function(e) {
  e.dataTransfer.setData("text/plain", 'set font-family');
  e.dataTransfer.effectAllowed = "move";
};

container.addEventListener('dragstart', function(e) {
  if (e.target.draggable) {
    e.dataTransfer.setData("text/plain", e.target.id + ' ' + e.offsetX + ' ' + e.offsetY);
    e.dataTransfer.effectAllowed = "move";
  }
}, true);

container.ondragenter = preventDefaultHandler;

container.ondragover = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

trashCan.ondragenter = preventDefaultHandler;

trashCan.ondragover = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

highlightIcon.ondragenter = preventDefaultHandler;

highlightIcon.ondragover = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

function typeset(code) {
  MathJax.startup.promise = MathJax.startup.promise
    .then(() => MathJax.typesetPromise(code()))
    .catch((err) => console.log('Typeset failed: ' + err.message));
  return MathJax.startup.promise;
}

container.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  let target = e.target;
  if (e.target != container && container.contains(e.target)) {
    let parent = e.target.parentElement;
    while (parent.id != 'container' && parent.tagName != 'SPAN') {
      parent = parent.parentElement;
    }
    if (parent.id != 'container') {
      target = parent;
    }
  }
  if (data[0] == 'set') {
    if (data[1] == 'font-size' && target.tagName == 'SPAN') {
      target.style.fontSize = fontSizeSelect.value;
    } else if (data[1] == 'font-family' && target.tagName == 'SPAN') {
      target.style.fontFamily = fontFamilySelect.value;
    } else if (data[1] == 'color' && target.tagName == 'SPAN') {
      target.style.color = data[2];
    } else if (data[1] == 'highlight' && target.tagName == 'SPAN') {
      target.style.backgroundColor = 'yellow';
    } else if (data[1] == 'image-width' && target.tagName == 'IMG') {
      target.style.width = imageWidth.value + 'px';
    } else if (data[1] == 'math' && target.tagName == 'SPAN') {
      typeset(() => {
        return [target];
      });
    } else if (data[1] == 'italic' && target.tagName == 'SPAN') {
      target.style.fontStyle = 'italic';
    } else if (data[1] == 'underline' && target.tagName == 'SPAN') {
      target.style.textDecoration = 'underline';
    } else if (data[1] == 'bold' && target.tagName == 'SPAN') {
      target.style.fontWeight = 'bold';
    } 
  } else {
    const element = document.getElementById(data[0]);
    element.style.top = e.pageY - parseInt(data[2]) + 'px';
    element.style.left = e.pageX - parseInt(data[1]) + 'px';
    element.style.position = 'absolute';
    this.appendChild(element);
    e.preventDefault();
  }
};

trashCan.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.remove();
  e.preventDefault();
};

highlightIcon.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.style.backgroundColor = 'unset';
  e.preventDefault();
};

function createElementFromHTML(htmlString) {
  var div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild; 
}

async function loadPDF(file) {
  var currentPage = 1;
  var canvasList = [];

  const buffer = await file.arrayBuffer();
  const task = pdfjsLib.getDocument(buffer);
  task.promise.then(function(pdf) {
    getPage();
    function getPage() {
      pdf.getPage(currentPage).then(function(page) {
        const PRINT_UNITS = 300 / 72.0;
        const viewport = page.getViewport({scale: 1});
        const canvas = document.createElement('canvas');
        // canvas.height = viewport.height;
        // var dpr = window.devicePixelRatio || 1;
        canvas.width = Math.floor(viewport.width * PRINT_UNITS);
        canvas.height = Math.floor(viewport.height * PRINT_UNITS);
        // canvas.width = viewport.width;
        ctx = canvas.getContext('2d', { alpha: false });
        ctx.save();
        ctx.fillStyle = "rgba(255, 255, 255, 1)";
        ctx.strokeStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        page.render({ canvasContext: ctx, viewport: viewport, intent: 'print', transform: [PRINT_UNITS, 0, 0, PRINT_UNITS, 0, 0] }).promise.then(function() {
          canvasList.push(canvas);
          if (currentPage < pdf.numPages) {
              currentPage++;
              getPage();
          } else {
            for(let canvas of canvasList) {
              const base64 = canvas.toDataURL('image/png');
              const tmp = base64.split(',');
              const data = atob(tmp[1]);
              const mime = tmp[0].split(':')[1].split(';')[0];
              const buf = new Uint8Array(data.length);
              for (let i = 0; i < data.length; i++) {
                buf[i] = data.charCodeAt(i);
              }
              const blob = new Blob([buf], { type: mime });
              appendImage(blob);
            }
          }
        });
      });
    }
  });
}

fileDropZone.ondrop = function(e) {
  e.preventDefault();
  if (e.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    for (let i = 0; i < e.dataTransfer.items.length; i++) {
      // If dropped items aren't files, reject them
      if (e.dataTransfer.items[i].kind === 'file') {
        let file = e.dataTransfer.items[i].getAsFile();
        if (file.type.includes('image')) {
          appendImage(file);
        } else if (file.type.includes('application/pdf')) {
          loadPDF(file);
        }
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      if (e.dataTransfer.files[i].type.includes('image')) {
        appendImage(e.dataTransfer.files[i]);
      } else if (e.dataTransfer.files[i].type.includes('application/pdf')) {
        loadPDF(e.dataTransfer.files[i]);
      }
    }
  }
};

fileDropZone.ondragover = preventDefaultHandler;

function appendImage(file) {
  const image = document.createElement('img');
  image.src = URL.createObjectURL(file);
  image.draggable = true;
  image.id = 'image-' + image_i.toString(36);
  image_i++;
  container.appendChild(image);
}

for (let colorLabel of colorLabels) {
  colorLabel.ondragstart = function(e) {
    // e.preventDefault();
    e.dataTransfer.setData('text/plain', 'set color ' + this.style.color);
    e.dataTransfer.effectAllowed = 'move';
  };
}

highlightIcon.ondragstart = function(e) {
  e.dataTransfer.setData('text/plain', 'set highlight');
  e.dataTransfer.effectAllowed = 'move';
}

imageWidthLabel.ondragstart = function(e) {
  e.dataTransfer.setData('text/plain', 'set image-width');
  e.dataTransfer.effectAllowed = 'move';
}

mathIcon.ondragstart = function(e) {
  e.dataTransfer.setData('text/plain', 'set math');
  e.dataTransfer.effectAllowed = 'move';
}


// text style and decoration
const italicIcon = document.getElementById('italic-icon');
const underlineIcon = document.getElementById('underline-icon');
const boldIcon = document.getElementById('bold-icon');
italicIcon.ondragstart = function (e) {
  e.dataTransfer.setData('text/plain', 'set italic');
}
italicIcon.ondragenter = preventDefaultHandler;
italicIcon.ondragover = preventDefaultHandler;
italicIcon.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.style.fontStyle = 'unset';
  e.preventDefault();
};
underlineIcon.ondragstart = function (e) {
  e.dataTransfer.setData('text/plain', 'set underline');
}
underlineIcon.ondragenter = preventDefaultHandler;
underlineIcon.ondragover = preventDefaultHandler;
underlineIcon.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.style.textDecoration = 'unset';
  e.preventDefault();
};
boldIcon.ondragstart = function (e) {
  e.dataTransfer.setData('text/plain', 'set bold');
}
boldIcon.ondragenter = preventDefaultHandler;
boldIcon.ondragover = preventDefaultHandler;
boldIcon.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.style.fontWeight = 'unset';
  e.preventDefault();
};

// Page size control
const btnExpandPage = document.getElementById('btn-expand-page');
btnExpandPage.onclick = function(e) {
  e.preventDefault();
  if (e.ctrlKey) {
    container.style.height = parseInt(container.style.height.substr(0, container.style.height.length - 2)) - 100 + 'px';
  } else {
    container.style.height = parseInt(container.style.height.substr(0, container.style.height.length - 2)) + 100 + 'px';
  }
}

// For test
// const testIcon = document.getElementById('test-icon');
// testIcon.ondragstart = function (e) {
//   e.dataTransfer.setData('application/json', {'a':1, b: true, c: 'hello'});
// }