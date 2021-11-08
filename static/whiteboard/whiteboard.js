var span_i = 0;
var image_i = 0;
const container = document.getElementById('container');
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

container.ondragenter = function(e) {
  return false;
};

container.ondragover = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

trashCan.ondragenter = function(e) {
  e.preventDefault();
};

trashCan.ondragover = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
};

highlightIcon.ondragenter = function(e) {
  e.preventDefault();
};

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
    }  else if (data[1] == 'underline' && target.tagName == 'SPAN') {
      target.style.textDecoration = 'underline';
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
  container.removeChild(span);
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
        }
      }
    }
  } else {
    // Use DataTransfer interface to access the file(s)
    for (var i = 0; i < e.dataTransfer.files.length; i++) {
      if (e.dataTransfer.files[i].type.includes('image')) {
        appendImage(e.dataTransfer.files[i]);
      }
    }
  }
};

fileDropZone.ondragover = function(e) { e.preventDefault(); };

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

// text decoration
const italicIcon = document.getElementById('italic-icon');
const underlineIcon = document.getElementById('underline-icon');
italicIcon.ondragstart = function (e) {
  e.dataTransfer.setData('text/plain', 'set italic');
}
italicIcon.ondragenter = function(e) { e.preventDefault(); };
italicIcon.ondragover = function(e) { e.preventDefault(); };
italicIcon.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.style.fontStyle = 'unset';
  e.preventDefault();
};
underlineIcon.ondragstart = function (e) {
  e.dataTransfer.setData('text/plain', 'set underline');
}
underlineIcon.ondragenter = function(e) { e.preventDefault(); };
underlineIcon.ondragover = function(e) { e.preventDefault(); };
underlineIcon.ondrop = function(e) {
  const data = e.dataTransfer.getData("text/plain").split(' ');
  const span = document.getElementById(data[0]);
  span.style.textDecoration = 'unset';
  e.preventDefault();
};