/* ----- To start: 'nodemon server.js' ----- */
const app = require("./app");

app.listen(3000, () => {
  console.log("Server is running on port 3000");
  console.log("http://localhost:3000/");
});
