function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

const encodeAttr = (str) => {
  return escape(JSON.stringify(str));
};
const decodeAttr = (str) => {
  let ret;
  try {
    ret = JSON.parse(unescape(str));
  } catch (e) {
    ret = null;
  }
  return ret;
};

async function getDataFromAPI(url) {
  //    https://rickandmortyapi.com/api/character
  let data = await (await fetch(url)).json();

  return data;
}

function getAttributesStartingWith(el, str) {
  return Array.from(el.attributes).filter((k) => k.name.startsWith(str));
}

function convertStringToComponentFriendlyName(str) {
  return (
    "app-" +
    str
      .toLowerCase()
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
      .replace("_", "-")
  );
}

function removeCurlyBrackets(str) {
  return str.trim().replace("{{", "").replace("}}", "");
}

function cloneAttributes(target, source) {
  [...source.attributes].forEach((attr) => {
    target.setAttribute(attr.nodeName, attr.nodeValue);
  });
}

function duplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function moveAllChildrenNodes(oldParent, newParent) {
  while (oldParent.childNodes.length) {
    newParent.appendChild(oldParent.firstChild);
  }
}

function hasCurlyBrackets(val) {
  return val.trim().startsWith("{{") && val.trim().endsWith("}}") > -1;
}

function evalInComponent(value, compo, i) {
  let updatedVal;

  if (hasCurlyBrackets(value)) {
    // debugger;
    let newValWithNoCurly = removeCurlyBrackets(value);

    // let updatedVal;

    try {
      updatedVal = eval("compo.state." + newValWithNoCurly.toLowerCase());
    } catch (e) {}

    if (updatedVal) return updatedVal;

    //try to see if it's a function
    try {
      let evalled = eval(newValWithNoCurly);
      if (evalled instanceof Function) {
        updatedVal = evalled.bind(compo)();
      }
    } catch (e) {}

    if (updatedVal) return updatedVal;

    //IT'S NOT A FUNCTION, ANS IT'S NOT A STATE
    // debugger;
    try {
      let evalled = eval(newValWithNoCurly);
      if (evalled instanceof Object) {
        updatedVal = evalled;
      }
    } catch (e) {
      //IT'S NOT AN OBJECT, IT'S NOT A FUNCTION, IT'S NOT A STATE
    }

    if (updatedVal) return updatedVal;
  } else {
    //DOESN'T HAVE {{}}
    return compo.getState(value.trim()) || "";
  }
  return updatedVal;
}
