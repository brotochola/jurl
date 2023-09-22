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
  return str.replace("{{", "").replace("}}", "");
}

function cloneAttributes(target, source) {
  [...source.attributes].forEach((attr) => {
    target.setAttribute(attr.nodeName, attr.nodeValue);
  });
}

function duplicate(obj) {
  return JSON.parse(JSON.stringify(obj));
}
