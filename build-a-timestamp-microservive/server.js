import express from "express";
import cors from "cors";

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.static("public"));

app.get("/", (_req, res) => {
  res.sendFile(import.meta.dirname + "/views/index.html");
});

// Do not change code above this line

app.get("/api{/:date}", (req, res) => {
  const { date } = req.params; // Destructures the date from our parameters.

  // If a date was not provided, return an object representing the current time.
  if (date === undefined) {
    const defaultDate = new Date();
    return res.json({
      unix: defaultDate.getTime(),
      utx: defaultDate.toUTCString()
    });
  }

  const isUnix = /^\d+$/.test(date); // Uses regex to match our date (checking for unix timestamps).
  const parsedDate = isUnix ? new Date(Number(date)) : new Date(date); // Based on the result of isUnix, parses the date accordingly.

  // If the user provided an invalid date (i.e., /api/elephant), returns an object representing an error.
  if (Number.isNaN(parsedDate.getTime())) {
    return res.json({
      error: "Invalid Date"
    });
  }

  // Return the requested object.
  return res.json({
    unix: parsedDate.getTime(),
    utc: parsedDate.toUTCString()
  })
})

// Do not change code below this line

const PORT = 8000;
const listener = app.listen(PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
