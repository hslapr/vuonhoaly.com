function isDroppable(element) {
  return element.classList.contains("droppable");
}

function preventDefaultHandler(e) {
  e.preventDefault();
}

generateDragDropData = function (e) {
  let data = {
    offsetX: e.offsetX,
    offsetY: e.offsetY,
    pageX: e.pageX,
    pageY: e.pageY
  };
  return data;
}

function getElement(data) {
  if (data.element) {
    return data.element;
  }
  return document.getElementById(data.id);
}

function prepareArgs(argsList, map) {
  let argsListCopy = [];
  for (let args of argsList) {
    let argsCopy = {};
    for (let k in args) {
      let v = args[k];
      for (let mapK in map) {
        v = v.replace(mapK, map[mapK]);
      }
      argsCopy[k] = v;
    }
    argsListCopy.push(argsCopy);
  }
  return argsListCopy;
}

function setStyle(element, style) {
  console.log("in setStyle");
  for (let k in style) {
    element.style[k] = style[k];
  }
}

function typeset(code) {
  MathJax.startup.promise = MathJax.startup.promise
    .then(() => MathJax.typesetPromise(code()))
    .catch((err) => console.log('Typeset failed: ' + err.message));
  return MathJax.startup.promise;
}

function fileToImg(file) {
  const image = document.createElement('img');
  image.src = URL.createObjectURL(file);
  image.draggable = true;
  image.classList.add("droppable");
  return image
}

function loadImage(whiteboard, file) {
  let img = fileToImg(file);
  img.id = "img-" + whiteboard.imgIndex.toString(36);
  whiteboard.imgIndex++;
  whiteboard.container.appendChild(img);
}

async function loadPDF(whiteboard, file) {
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
              loadImage(whiteboard, blob);
            }
          }
        });
      });
    }
  });
}
