function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const randomColor = () =>
  "#" + Math.floor(Math.random() * 16777215).toString(16);

const encodeAttr = (str) => {
  return escape(JSON.stringify(str));
};
const decodeAttr = (str) => {
  return JSON.parse(unescape(str));
};

async function getDataFromAPI(url) {
  //    https://rickandmortyapi.com/api/character
  let data = await (await fetch(url)).json();

  return data;
}
