globalThis.whiteboard = {
  configWhiteboard: function() {
    globalThis.whiteboard.container = document.getElementById(globalThis.whiteboard.config.container.id);
    globalThis.whiteboard.container.style.height = window.innerHeight + 'px';
    globalThis.whiteboard.container.ondragenter = preventDefaultHandler;
    globalThis.whiteboard.container.ondragover = preventDefaultHandler;
    globalThis.whiteboard.spanIndex = globalThis.whiteboard.config.spanStartIndex;
    globalThis.whiteboard.imgIndex = globalThis.whiteboard.config.imgStartIndex;
    globalThis.whiteboard.loadToolbar();
    if (globalThis.whiteboard.config.toolbar.fontSizeToolId) {
      globalThis.whiteboard.fontSizeTool = document.getElementById(globalThis.whiteboard.config.toolbar.fontSizeToolId);
    }
    if (globalThis.whiteboard.config.toolbar.fontFamilyToolId) {
      globalThis.whiteboard.fontFamilyTool = document.getElementById(globalThis.whiteboard.config.toolbar.fontFamilyToolId);
    }
    if (globalThis.whiteboard.config.toolbar.colorToolId) {
      globalThis.whiteboard.colorTool = document.getElementById(globalThis.whiteboard.config.toolbar.colorToolId);
    }
  
    globalThis.whiteboard.container.ondrop = function(e) {
      let target = e.target;
      while (!isDroppable(target)) {
        target = target.parentElement;
      }
      const dragData = JSON.parse(e.dataTransfer.getData("application/json"));
      const dropData = generateDragDropData(e);
      dropData.element = target;
      dropData.from = dragData;
      if (dragData.action) {
        for (let i = 0; i < dragData.action.length; i++) {
          if (dragData.args && dragData.args.length > i) {
            globalThis.whiteboard.actions[dragData.action[i]](dropData, dragData.args[i]);
          } else {
            globalThis.whiteboard.actions[dragData.action[i]](dropData);
          }
        }
      } else {
      }
      e.preventDefault();
    }
    
    globalThis.whiteboard.container.ondragstart = function(e) {
      const data = generateDragDropData(e);
      data.id = e.target.id;
      data.action = ["move"];
      e.dataTransfer.setData("application/json", JSON.stringify(data));
    }
    
    globalThis.whiteboard.container.addEventListener('click', function(e) {
      for (let element of document.getElementsByName('i')) {
        globalThis.whiteboard.container.removeChild(element);
      }
      const input = document.createElement('input');
      input.type = 'text';
      input.style.position = 'absolute';
      input.style.top = e.pageY  + 'px';
      input.style.left = e.pageX + 'px';
      input.size = 20;
      input.name = 'i';
      globalThis.whiteboard.container.appendChild(input);
      input.focus();
      input.addEventListener('keypress', function(e) {
        if (e.key == 'Enter') {
          if (this.value.length > 0) {
            const span = document.createElement('span');
            span.id = 'span-' + globalThis.whiteboard.spanIndex.toString(36);
            if (globalThis.whiteboard.fontSizeTool) { span.style.fontSize = globalThis.whiteboard.fontSizeTool.value; }
            if (globalThis.whiteboard.fontFamilyTool) { span.style.fontFamily = globalThis.whiteboard.fontFamilyTool.value; }
            if (globalThis.whiteboard.colorTool) {
              let data = new FormData(globalThis.whiteboard.colorTool);
              span.style.color = data.get('color');
            }
            globalThis.whiteboard.spanIndex++;
            span.textContent = this.value;
            span.draggable = true;
            span.style.position = this.style.position;
            span.style.top = this.style.top;
            span.style.left = this.style.left;
            span.classList.add("droppable");
            globalThis.whiteboard.container.appendChild(span);
          }
          globalThis.whiteboard.container.removeChild(this);
        }
      }, true);
    }, true);
  }
}

const request = new XMLHttpRequest();
request.open('GET', 'config.default.json');
request.responseType = 'json';
request.send();
request.onload = function() {
  globalThis.whiteboard.config = request.response;
  globalThis.whiteboard.configWhiteboard();
}

globalThis.whiteboard.loadToolbar = function () {
  globalThis.whiteboard.toolbar = document.getElementById(globalThis.whiteboard.config.toolbar.id);
  globalThis.whiteboard.toolbar.innerHTML = "";
  // for (let child of globalThis.whiteboard.toolbar.children) {
  //   child.remove();
  // }
  for (const tool of globalThis.whiteboard.config.toolbar.tools) {
    if (tool.enabled) {
      globalThis.whiteboard.loadTool(tool);
    }
  }
}

globalThis.whiteboard.loadTool = function(tool) {
  switch (tool.type) {
    case "span":
      const tag = document.createElement("span");
      tag.id = tool.name + "-tool";
      if (tool.class) {
        tag.classList.add(...tool.class);
      }
      tag.classList.add("tool");
      if (tool.lang) { tag.lang = tool.lang; }
      if (tool.text) { tag.innerText = tool.text; }
      if (tool.style) {
        setStyle(tag, tool.style);
      }
      if (tool.draggable) {
        tag.draggable = true;
        tag.ondragstart = function (e) {
          let data = generateDragDropData(e);
          data.id = e.target.id;
          if (tool.dragAction) { data.action = tool.dragAction; }
          if (tool.dragArgs) { data.args = tool.dragArgs; }
          e.dataTransfer.setData("application/json", JSON.stringify(data));
        }
      }
      if (tool.droppable) {
        tag.ondragenter = preventDefaultHandler;
        tag.ondragover = preventDefaultHandler;
        tag.ondrop = function(e) {
          data = {};
          const jsonString = e.dataTransfer.getData("application/json");
          if (jsonString) {
            data = JSON.parse(e.dataTransfer.getData("application/json"));
          }
          if (e.dataTransfer.items) {
            for (let i = 0; i < e.dataTransfer.items.length; i++) {
              if (e.dataTransfer.items[i].kind === 'file') {
                let file = e.dataTransfer.items[i].getAsFile();
                if (data.files) {
                  data.files.push(file);
                } else {
                  data.files = [file];
                }
              }
            }
          } else if (e.dataTransfer.files.length) {
            data.files = e.dataTransfer.files;
          }
          for (let i = 0; i < tool.dropAction.length; i++) {
            if (tool.dropArgs && tool.dropArgs.length > i) {
              globalThis.whiteboard.actions[tool.dropAction[i]](data, tool.dropArgs[i]);
            } else {
              globalThis.whiteboard.actions[tool.dropAction[i]](data);
            }
          }
          e.preventDefault();
        };
      }
      globalThis.whiteboard.toolbar.appendChild(tag);
      break;
    case "radio":
      let form = document.createElement("form");
      form.classList.add("tool");
      form.name = tool.name;
      form.id = tool.name + "-tool";
      form.style.display = "inline-block"
      let optionIndex = 0;
      for (let option of tool.options) {
        let label = document.createElement("label");
        label.innerText = option.label.text;
        if (option.label.style) {
          setStyle(label, option.label.style);
        }
        let input = document.createElement("input");
        input.type = "radio";
        input.value = option.value;
        input.name = tool.name;
        input.id = tool.name + optionIndex;
        if (optionIndex == 0) { input.checked = true; }
        label.id = input.id + "-label";
        label.setAttribute("for", input.id);
        if (tool.labelDraggable) {
          label.draggable = true;
          label.ondragstart = function (e) {
            let data = generateDragDropData(e);
            data.id = e.target.id;
            if (tool.dragAction) { data.action = tool.dragAction; }
            if (tool.dragArgs) {
              data.args = prepareArgs(tool.dragArgs,
                { "$(this.for.value)": document.getElementById(input.id).value.toString() });
            }
            console.log(data);
            e.dataTransfer.setData("application/json", JSON.stringify(data));
          }
        }
        form.appendChild(input);
        form.appendChild(label);
        optionIndex++;
      }
      globalThis.whiteboard.toolbar.appendChild(form);
      break;

    case "input":
      let inputForm = document.createElement("form");
      inputForm.classList.add("tool");
      inputForm.name = tool.name;
      inputForm.id = tool.name + "-form";
      inputForm.style.display = "inline-block"
      let inputLabel = document.createElement("label");
      inputLabel.id = tool.name + "-label";
      inputLabel.innerText = tool.label.text;
      if (tool.label.class) {
        inputLabel.classList.add(...tool.label.class);
      }
      if (tool.label.lang) {
        inputLabel.lang = tool.label.lang;
      }
      if (tool.label.style) {
        setStyle(inputLabel, tool.label.style);
      }
      if (tool.labelDraggable) {
        inputLabel.draggable = true;
        inputLabel.ondragstart = function (e) {
          let data = generateDragDropData(e);
          data.id = e.target.id;
          if (tool.dragAction) { data.action = tool.dragAction; }
          if (tool.dragArgs) {
            data.args = prepareArgs(tool.dragArgs,
              { "$(this.value)": document.getElementById(tool.name + "-tool").value.toString() });
          }
          e.dataTransfer.setData("application/json", JSON.stringify(data));
        }
      }
      let input = document.createElement("input");
      input.id = tool.name + "-tool";
      input.type = tool.inputType;
      input.value = tool.value;
      input.max = tool.max;
      input.min = tool.min;
      input.step = tool.step;
      inputForm.appendChild(inputLabel);
      inputForm.appendChild(input);
      globalThis.whiteboard.toolbar.appendChild(inputForm);
      break;
    
    case "select":
      let selectForm = document.createElement("form");
      selectForm.style.display = "inline-block";
      selectForm.classList.add("tool");
      selectForm.id = tool.name + "-form";
      let label = document.createElement("label");
      label.innerText = tool.label.text;
      label.id = tool.name + "-label";
      if (tool.label.class) {
        label.classList.add(...tool.label.class);
      }
      if (tool.label.lang) {
        label.lang = tool.label.lang;
      }
      if (tool.label.style) {
        setStyle(label, tool.label.style);
      }
      if (tool.labelDraggable) {
        label.draggable = true;
        label.ondragstart = function (e) {
          let data = generateDragDropData(e);
          data.id = e.target.id;
          if (tool.dragAction) { data.action = tool.dragAction; }
          if (tool.dragArgs) {
            data.args = prepareArgs(tool.dragArgs,
              { "$(this.value)": document.getElementById(tool.name + "-tool").value.toString() });
          }
          e.dataTransfer.setData("application/json", JSON.stringify(data));
        }
      }
      let select = document.createElement("select");
      select.id = tool.name + "-tool";
      for (let i = 0; i < tool.options.length; ++i) {
        let option = document.createElement("option");
        if (i == 0) { option.selected = true; }
        option.value = tool.options[i].value;
        option.innerText = tool.options[i].text;
        select.appendChild(option);
      }
      selectForm.appendChild(label);
      selectForm.appendChild(select);
      globalThis.whiteboard.toolbar.appendChild(selectForm);
      break;

    case "link":
      let link = document.createElement("a");
      link.classList.add("tool");
      link.id = tool.name + "-tool";
      link.href = tool.href;
      if (tool.lang) { link.lang = tool.lang; }
      if (tool.class) { link.classList.add(tool.class); }
      if (tool.style) { setStyle(link, tool.style); }
      link.innerText = tool.text;
      link.target = "_blank";
      globalThis.whiteboard.toolbar.appendChild(link);
      break;

    case "button":
      let btn = document.createElement("button");
      btn.classList.add("tool");
      btn.id = tool.name + "-tool";
      btn.type = "button";
      btn.innerText = tool.text;
      if (tool.action) {
        btn.onclick = globalThis.whiteboard.actions[tool.action];
      }
      globalThis.whiteboard.toolbar.appendChild(btn);
      break;

    default:
      break;
  }
}








// main.js

// globalThis.whiteboard.loadToolbar();