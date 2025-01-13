export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

export const encodeAttr = (str) => {
  return escape(JSON.stringify(str));
};
export const decodeAttr = (str) => {
  let ret;
  try {
    ret = JSON.parse(unescape(str));
  } catch (e) {
    ret = null;
  }
  return ret;
};

 export async function getDataFromAPI(url) {
  //    https://rickandmortyapi.com/api/character
  let data = await (await fetch(url)).json();

  return data;
}

export function getAttributesStartingWith(el, str) {
  return Array.from(el.attributes).filter((k) => k.name.startsWith(str));
}

export function replaceAll(string, search, replace) {
  return string.split(search).join(replace);
}

export function convertStringToComponentFriendlyName(str) {
  return "app-" + replaceAll(str, "_", "-").toLowerCase();
}
window.convertStringToComponentFriendlyName=convertStringToComponentFriendlyName


export function removeCurlyBrackets(str) {
  return str.trim().replace("{{", "").replace("}}", "");
}

export function cloneAttributes(target, source) {
  [...source.attributes].forEach((attr) => {
    target.setAttribute(attr.nodeName, attr.nodeValue);
  });
}

export function duplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export function moveAllChildrenNodes(oldParent, newParent) {
  while (oldParent.childNodes.length) {
    newParent.appendChild(oldParent.firstChild);
  }
}

export function hasCurlyBrackets(val) {
  return val.trim().startsWith("{{") && val.trim().endsWith("}}") > -1;
}

// EVAL IN COMPONENT IS THE FUNCTION THAT TAKES CARE OF REACTIVITY, AKA STUFF BETWEEN {{}} IN THE HTML

export function evalInComponent(value, compo, i) {
  let updatedVal;

  if (value.indexOf("[i]") > -1 && (i == undefined || i == null)) {
    return;
  }

  if (hasCurlyBrackets(value)) {
    // debugger;
    let newValWithNoCurly = removeCurlyBrackets(value);

    let stringToBeEvalled = "compo." + newValWithNoCurly;
    let evalled;

    try {
      evalled = eval(stringToBeEvalled);
    } catch (e) {}

    if (evalled instanceof Function) {
      updatedVal = evalled.bind(compo);
    } else if (evalled instanceof Object || typeof evalled == "string") {
      updatedVal = evalled;
    } else {
      //EVAL WAS UNDEFINED
      try {
        updatedVal = eval(
          "(function(){ return " + stringToBeEvalled + " })"
        ).bind(compo)();
      } catch (e) {
        try {
          const newStringToEval =
            "(function(){return " + newValWithNoCurly + ";} ) .bind(compo)";
          updatedVal = eval(newStringToEval)();
        } catch (e) {}
      }
    }
    return updatedVal;
  } else {
    //DOESN'T HAVE {{}}
    return compo.getState(value);
  }
}

export function createTree(component, hideComponent, showState) {
  const tree = {
    id: component.uid,
    tagName: component.tagName,
    // component: component,
    children: [],
    // html: (component.shadowRoot || {}).innerHTML || "",
  };
  if (!hideComponent) {
    tree.component = component;
  }

  if (showState) tree.state = component.state;

  const childrenComponents = component.getAllChildrenComponents();

  for (const childComponent of childrenComponents) {
    const childTree = createTree(childComponent, hideComponent, showState);
    tree.children.push(childTree);
  }

  return tree;
}

export function flattenWebComponents(component) {
  const tree = {
    children: [],
    tagName: component.tagName,
    html: removeHTMLComments((component.shadowRoot || {}).innerHTML || ""),
  };

  const childrenComponents = component.getAllChildrenComponents();

  for (const childComponent of childrenComponents) {
    const childTree = flattenWebComponents(childComponent);
    tree.children.push(childTree);
  }

  return tree;
}

export function buildInnerHTML(tree) {
  if (!tree || !tree.html) {
    return "";
  }

  let innerHTML = tree.html;

  if (tree.children && tree.children.length > 0) {
    for (const child of tree.children) {
      const childHTML = buildInnerHTML(child);
      const tagPlaceholder = `<${child.tagName}></${child.tagName}>`;
      innerHTML = innerHTML.replace(tagPlaceholder, childHTML);
    }
  }

  return innerHTML;
}
export function removeHTMLComments(str) {
  return str.replace(/<\!--.*?-->/g, "");
}

export function sanitizeHtmlString(inputString) {
  // Replace common HTML escape sequences with their corresponding characters
  const entityMap = {
    "&lt;": "<",
    "&gt;": ">",
    "&amp;": "&",
    "&quot;": '"',
    "&#x27;": "'",
    "&#x60;": "`",
    "&#x3C;": "<", // Also replace the unusual hex code
  };

  const sanitizedString = inputString.replace(
    /&(lt|gt|amp|quot|#x27|#x60|#x3C);/g,
    function (match) {
      return entityMap[match];
    }
  );

  // Remove any remaining non-ASCII characters
  const asciiOnlyString = sanitizedString.replace(/[^\x20-\x7E]/g, "");

  return asciiOnlyString;
}

export function compareObjects(obj1, obj2) {
  return JSON.stringify(obj1) == JSON.stringify(obj2);
}

export function removeLastCharacter(txt) {
  return txt.substr(0, txt.length - 1);
}

export const snakeToCamel = (str) => {
  return str
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace("-", "").replace("_", "")
    );
};

export function camelToSnake(text) {
  return text
    .split(/(?=[A-Z])/)
    .join("_") //here i use underscore because if i use "-" when converting the other way around, it may cause a loop
    .toLowerCase();
}
