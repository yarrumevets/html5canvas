const express = require("express");
const router = express.Router();
const app = express();
const port = 3031;
// const moment = require("moment");
// const bodyParser = require("body-parser");
// const parseurl = require("parseurl"); // for the session page count example

app.use("/", router);
app.listen(port, () => console.log(`Welcome. Listening on port ${port}`));

// Log visits.
// router.use((req, res, next) => {
//   console.log(
//     `Visited: ${moment().format("YYYY MMMM Do (dddd) @ h:mm:ss a")})`
//   );
//   next();
// });

// router.get("/", (req, res) => {
//   console.log("resume");
//   // res.send("coming soonish...");
//   res.sendFile("/files/resume.html", { root: __dirname });
// });

// Static public files.
router.use("/", express.static(__dirname + "/public"));
