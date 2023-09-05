function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const randomColor = () => Math.floor(Math.random() * 16777215).toString(16);
