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

function getAttributesStartingWithJ(el) {
  return Array.from(el.attributes).filter((k) => k.name.startsWith("j-"));
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
