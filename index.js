const express = require("express");
const fs = require("fs");
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.post("/addNames", (req, res) => {
  const name = req.body["name"];
  const age = req.body["age"];
  var time_to_live = isNaN(parseInt(req.body["time_to_live"]))
    ? -1
    : parseInt(req.body["time_to_live"]);
  if (name === undefined || age === undefined) {
    return;
  }
  fs.readFile("name.json", "utf8", (err, data) => {
    const TimeRightNow = Date.now();
    if (err) {
      obj = {
        [name]: {
          age: age,
          OriginalTime: TimeRightNow,
          time_to_live: time_to_live,
        },
      };
      json = JSON.stringify(obj);
      fs.writeFile("name.json", json, "utf8", (err) => {
        if (err) res.send("Failed!");
        else
          res.send(
            `Names added to NOSQL DB Successfully. The values added are as follows ${name} and ${age}`
          );
      });
    } else {
      obj = JSON.parse(data);
      if (
        !(name in obj) ||
        (TimeRightNow - obj[name]["OriginalTime"] >
          obj[name]["time_to_live"] * 1000 &&
          obj[name]["time_to_live"] != -1)
      ) {
        obj[name] = {
          age: age,
          OriginalTime: TimeRightNow,
          time_to_live: time_to_live,
        };
        json = JSON.stringify(obj);
        fs.writeFile("name.json", json, "utf8", (err) => {
          if (err) res.send("Failed!");
          else
            res.send(
              `Names added to NOSQL DB Successfully. The values added are as follows ${name} and ${age}`
            );
        });
      } else
        res.send(
          "Cannot add the data because name already exists in name.json DB"
        );
    }
  });
});

app.use(function (error, req, res, next) {
  if (error instanceof SyntaxError) {
    res.send("Error: Bad JSON format");
  } else {
    next();
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});
