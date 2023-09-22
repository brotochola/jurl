const express = require("express");

const app = express();

app.use(express.static("public"));

app.get("/*/*", (req, res) => {
  // console.log("#####", req.route);
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(3000);

// const { exec } = require("child_process");

// let command = `C:\Program Files\Google\Chrome\Application\chrome.exe http://localhost:3000`;

// exec(command);
