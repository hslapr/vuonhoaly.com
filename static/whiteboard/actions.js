globalThis.whiteboard.actions = {
  remove: function(data) {
    let element = getElement(data);
    element.remove();
  },
  setStyle: function (data, style) {
    let element = getElement(data);
    for (let k in style) {
      element.style[k] = style[k];
    }
  },
  typesetMath: function (data) {
    let element = getElement(data);
    let text = element.innerText;
    if (text.startsWith("$") && !text.startsWith("$$") && text.endsWith("$")) {
      element.innerText = "\\(" + text.substr(1, text.length - 2) + "\\)";
    }
    typeset(() => {
      return [element];
    });
  },
  loadFile: function (data) {
    if (data.files) {
      for (let file of data.files) {
        if (file.name == "config.json") {
          const reader = new FileReader();
          reader.onload = function(e) {
            let result = JSON.parse(e.target.result);
            globalThis.whiteboard.config = result;
            globalThis.whiteboard.configWhiteboard();
          }
          reader.readAsText(file);
        } else if (file.type.includes('image')) {
          loadImage(globalThis.whiteboard, file);
        } else if (file.type.includes('application/pdf')) {
          loadPDF(globalThis.whiteboard, file);
        }
      }
    }
  },
  move: function(data) {
    let element = getElement(data.from);
    element.style.top = data.pageY - data.from.offsetY + 'px';
    element.style.left = data.pageX - data.from.offsetX + 'px';
    element.style.position = 'absolute';
    globalThis.whiteboard.container.appendChild(element);
  },
  expandPage: function(e) {
    console.log("expandPage");
    e.preventDefault();
    if (e.ctrlKey) {
      globalThis.whiteboard.container.style.height = parseInt(globalThis.whiteboard.container.style.height.substr(0, globalThis.whiteboard.container.style.height.length - 2)) - 100 + 'px';
    } else {
      globalThis.whiteboard.container.style.height = parseInt(globalThis.whiteboard.container.style.height.substr(0, globalThis.whiteboard.container.style.height.length - 2)) + 100 + 'px';
    }
  }

}