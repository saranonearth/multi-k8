const keys = require("./keys");

// Express App Setup
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Postgres Client Setup
const { Pool } = require("pg");
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  database: keys.pgDatabase,
  password: keys.pgPassword,
  port: keys.pgPort,
});
pgClient.on("error", () => console.log("Lost PG connection"));

pgClient
  .query("CREATE TABLE IF NOT EXISTS values(number INT)")
  .then("TABLE WAS CREATED")
  .catch((err) => console.log(err));

// Redis Client Setup
const redis = require("redis");
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});
const redisPublisher = redisClient.duplicate();

// Express route handlers

app.get("/", (req, res) => {
  res.send("Hi");
  console.log(keys.pgUser);
  console.log(keys.pgHost);
  console.log(keys.pgDatabase);
  console.log(keys.pgPassword);
  console.log(keys.pgPort);
});

app.get("/values/all", async (req, res) => {
  console.log("HEREEEE in db fetch all");
  try {
    const values = await pgClient.query("SELECT * from values");
    res.send(values.rows);
  } catch (error) {
    console.log("DB ERROR FETCH", error);
  }
});

app.get("/values/current", async (req, res) => {
  console.log("REIDS DAATA FETCH");
  redisClient.hgetall("values", (err, values) => {
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if (parseInt(index) > 40) {
    return res.status(422).send("Index too high");
  }

  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  console.log(index);
  pgClient.query("INSERT INTO values(number) VALUES($1)", [index]).then(() => {
    console.log("ADDED TO DB");
  });

  res.send({ working: true });
});

app.listen(5000, (err) => {
  console.log("Listening");
});
