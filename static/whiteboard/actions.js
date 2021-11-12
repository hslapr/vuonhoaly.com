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
  setAttribute: function (data, attribute) {
    let element = getElement(data);
    for (let k in attribute) {
      element.setAttribute(k, attribute[k]);
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
    e.preventDefault();
    if (e.ctrlKey) {
      globalThis.whiteboard.container.style.height = parseInt(globalThis.whiteboard.container.style.height.substr(0, globalThis.whiteboard.container.style.height.length - 2)) - 100 + 'px';
    } else {
      globalThis.whiteboard.container.style.height = parseInt(globalThis.whiteboard.container.style.height.substr(0, globalThis.whiteboard.container.style.height.length - 2)) + 100 + 'px';
    }
  },
  setValue: function(data, args) {
    let element = getElement(data);
    let target = document.getElementById(args.targetId);
    target.value = eval(args.value);
  },
  drawLine: function(data, args) {
    let point = document.getElementById("line-point-1");
    if (point) {
      let line = document.createElement("div");
      line.id = "shape-" + globalThis.whiteboard.shapeIndex.toString(36);
      globalThis.whiteboard.shapeIndex++;
      let left = parseInt(point.style.left.substr(0, point.style.left.length - 2));
      let top = parseInt(point.style.top.substr(0, point.style.top.length - 2))
      let centerX = (left + data.pageX) / 2;
      let centerY = (top + data.pageY) / 2;
      let dx = data.pageX - left;
      let dy = data.pageY - top;
      let length = Math.floor(Math.sqrt(dx * dx + dy * dy));
      line.style.left = Math.floor(centerX - length / 2) + "px";
      line.style.top = Math.floor(centerY) + "px";
      line.style.width = length + "px";
      line.style.transform = "rotate(" + Math.atan(dy / dx) + "rad)";
      setStyle(line, args);
      line.style.position = "absolute";
      point.remove();
      line.draggable = true;
      line.classList.add("shape");
      line.classList.add("droppable");
      globalThis.whiteboard.container.appendChild(line);
    } else {
      point = document.createElement("span");
      point.innerText = "\u00b7";
      point.classList.add("droppable");
      point.id = "line-point-1";
      point.style.left = data.pageX + "px";
      point.style.top = data.pageY + "px";
      point.style.position = "absolute";
      globalThis.whiteboard.container.appendChild(point);
    }
  },
  drawRect: function(data, args) {
    let tool = getElement(data.from);
    let leftTop = document.getElementById("rect-left-top");
    if (leftTop) {
      let rect = document.createElement("div");
      rect.id = "shape-" + globalThis.whiteboard.shapeIndex.toString(36);
      globalThis.whiteboard.shapeIndex++;
      rect.style.left = leftTop.style.left;
      rect.style.top = leftTop.style.top;
      rect.style.width = data.pageX - parseInt(leftTop.style.left.substr(0, leftTop.style.left.length - 2)) + "px";
      rect.style.height = data.pageY - parseInt(leftTop.style.top.substr(0, leftTop.style.top.length - 2)) + "px";
      setStyle(rect, args);
      rect.style.position = "absolute";
      leftTop.remove();
      rect.draggable = true;
      rect.classList.add("shape");
      rect.classList.add("droppable");
      globalThis.whiteboard.container.appendChild(rect);
      tool.innerText = "\u231c";
    } else {
      leftTop = document.createElement("span");
      leftTop.innerText = "\u231c";
      leftTop.classList.add("droppable");
      leftTop.id = "rect-left-top";
      leftTop.style.left = data.pageX + "px";
      leftTop.style.top = data.pageY + "px";
      leftTop.style.position = "absolute";
      globalThis.whiteboard.container.appendChild(leftTop);
      tool.innerText = "\u231f";
    }
  },
  drawCircle: function(data, args) {
    let center = document.getElementById("circle-center");
    if (center) {
      let centerX = parseInt(center.style.left.substr(0, center.style.left.length - 2));
      let centerY = parseInt(center.style.top.substr(0, center.style.top.length - 2));
      let dx = data.pageX - centerX;
      let dy = data.pageY - centerY;
      let r = Math.sqrt(dx * dx + dy * dy);
      let circle = document.createElement("div");
      circle.id = "shape-" + globalThis.whiteboard.shapeIndex.toString(36);
      globalThis.whiteboard.shapeIndex++;
      circle.style.left = Math.floor(centerX - r) + "px";
      circle.style.top = Math.floor(centerY - r) + "px";
      circle.style.width = Math.floor(r * 2) + "px";
      circle.style.height = circle.style.width;
      setStyle(circle, args);
      circle.style.position = "absolute";
      circle.classList.add("shape");
      circle.classList.add("droppable");
      circle.draggable = true;
      center.remove();
      globalThis.whiteboard.container.appendChild(circle);
    } else {
      center = document.createElement("span");
      center.innerText = "\u00b7";
      center.classList.add("droppable");
      center.id = "circle-center";
      center.style.left = data.pageX + "px";
      center.style.top = data.pageY + "px";
      center.style.position = "absolute";
      globalThis.whiteboard.container.appendChild(center);
    }
  },
  drawShape: function(data, args) {
    switch (args.shape) {
      case "rect":
        
        break;
      case "circle":
        break;
      default:
        break;
    }
  }
}