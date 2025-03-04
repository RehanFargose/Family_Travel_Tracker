import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

// Enter your db credentials
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "postgres",
  port: 5432,
});


db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 2;

// Var to hold all users retrieved from db
let users = [];

async function checkVisisted() {
  // Get only the country codes visited by the current user
  const result = await db.query("SELECT country_code FROM visited_countries AS vc JOIN users ON users.id = vc.user_id WHERE vc.user_id=$1",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

// Function to get current user
async function getCurrentUser(){
  const result2 = await db.query("SELECT * FROM users");
  users = result2.rows;
  console.log("The list of all users found from db is: "+users);


  // Return singular current User, instead of full array/list of users
  return users.find((user) => user.id == currentUserId);
}

// let usersList = [];
// Home page route
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  var currentUser = await getCurrentUser();


  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: currentUser.color,
  });
});


// Adding new countries on the map
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    let countryCode = data.country_code;
    if (countryCode === "IO") {
      countryCode = "IN";
    }

    console.log("Newly added country code is: "+countryCode);
    console.log("The current userID is: "+currentUserId);
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
        [countryCode, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});



// Method to go to new page
app.post("/user", async (req, res) => {
  // Get the user's id
  var clickedUid = req.body.user;
  console.log("The clicked user's id is: "+clickedUid);

  // If the add attribute is set to new then go to new page, this is a custom attribute just for this purpose
  if(req.body.add === "new"){
    console.log("Going to add user's page");

    console.log(req.body.name);
    // If the add button with value of new is clicked, open the new user button
    res.render("new.ejs");
  }
  else{
    console.log("Switching  between users to: "+users.find((user) => user.id == clickedUid).name);

    // console.log(req.body.name);
    // If username button is clicked switch the Homepage map
    currentUserId = clickedUid;
    res.redirect("/");
  }


});


// Function to add new User/Family member
async function addNewUser(newUser, newColor){
  const result = await db.query("INSERT INTO users(name, color) VALUES($1, $2) RETURNING *;", [newUser, newColor]);
  var newusers = result.rows;
  console.log("The list of all users found from db after adding new user is: "+newusers);

  // Store the id of the latest user
  const latestID = result.rows[0].id;

  // Set currentID to user
  currentUserId = latestID;

}


// Route to add new user
app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const newUserName = req.body.name;
  const newUserColor = req.body.color;
  console.log("The new user to be added is: "+newUserName);
  console.log("The new user's color is: "+newUserColor);

  // Add the new user and their color to the users database
  addNewUser(newUserName, newUserColor);

  res.redirect("/");

});


// To start the app
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
