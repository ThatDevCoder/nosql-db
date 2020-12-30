const express = require("express");
const fs = require("fs");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.post("/addNames", (req, res) => {
  const name = req.body["name"];
  //   console.log(`The length of name/key is ${name.length}`);
  const address = req.body["address"];
  //   console.log(`The length of the value is ${address.toString.length}`);
  let time_to_live_parsed = parseInt(req.body["time_to_live"]);
  if (name.length > 32 || address.length > 16000) {
    res.send(
      "Character more than limit name should be not more than 32 chars and value should not be more than 16000 chars or 16KB"
    );
    res.send("Couldn't add to DB");
    return;
  }
  if (isNaN(time_to_live_parsed)) {
    time_to_live = -1;
  } else {
    time_to_live = time_to_live_parsed;
  }
  if (name === undefined || address === undefined) {
    return;
  }
  fs.readFile("name.json", "utf8", (err, data) => {
    const TimeRightNow = Date.now();
    if (err) {
      obj = {
        [name]: {
          address: address,
          OriginalTime: TimeRightNow,
          time_to_live: time_to_live,
        },
      };
      json = JSON.stringify(obj);
      fs.writeFile("name.json", json, "utf8", (err) => {
        if (err)
          res.send("Failed! Couldn't read the JSON file or it does not exists");
        else
          res.send(
            `Names added to NOSQL DB Successfully. The values added are as follows ${name} and ${address}`
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
          address: address,
          OriginalTime: TimeRightNow,
          time_to_live: time_to_live,
        };
        json = JSON.stringify(obj);
        fs.writeFile("name.json", json, "utf8", (err) => {
          if (err)
            res.send(
              "Failed! Couldn't read the JSON file or it does not exists"
            );
          else
            res.send(
              `Names added to NOSQL DB Successfully. The values added are as follows ${name} and ${address}`
            );
        });
      } else
        res.send(
          "Cannot add the data because name already exists in name.json DB"
        );
    }
  });
});

app.post("/removeName", (req, res) => {
  const name = req.body["name"];
  if (name === undefined) {
    res.send("Could not parse the incoming data");
    return;
  }
  fs.readFile("name.json", "utf8", (err, data) => {
    if (err)
      res.send("Failed! Couldn't read the JSON file or it does not exists");
    else {
      obj = JSON.parse(data);
      const TimeRightNow = Date.now();

      if (
        name in obj &&
        (TimeRightNow - obj[name]["OriginalTime"] <=
          obj[name]["time_to_live"] * 1000 ||
          obj[name]["time_to_live"] == -1)
      ) {
        delete obj[name];
        json = JSON.stringify(obj);
        fs.writeFile("name.json", json, "utf8", (err) => {
          if (err)
            res.send(
              "Failed! Couldn't read the JSON file or it does not exists"
            );
          else
            res.send(
              `The data with the name of ${name} is successfully deleted from JSON DB`
            );
        });
      } else
        res.send(
          `Couldn't delete ${name} this could occur either of the two reasons maybe TTL would have been expired or the name doesn't exists in JSON database`
        );
    }
  });
});

app.post("/getNames", (req, res) => {
  const name = req.body["name"];
  if (name === undefined) {
    res.send("Error: Could not parse GET data");
    return;
  }
  fs.readFile("name.json", "utf8", (err, data) => {
    if (err)
      res.send("Failed! Couldn't read the JSON file or it does not exists");
    else {
      obj = JSON.parse(data);
      const TimeRightNow = Date.now();
      if (
        name in obj &&
        (TimeRightNow - obj[name]["OriginalTime"] <=
          obj[name]["time_to_live"] * 1000 ||
          obj[name]["time_to_live"] == -1)
      )
        res.send(obj[name]);
      else
        res.send(
          `Couldn't retrieve ${name} this could occur either of the two reasons maybe TTL would have been expired or the name doesn't exists in JSON database`
        );
    }
  });
});

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    res.send(
      "Please check for your JSON format. It's invalid. It should have {} braces"
    );
  } else {
    next();
  }
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});
