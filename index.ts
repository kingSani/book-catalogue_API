import dotenv from "dotenv";
dotenv.config();
import type { Request, Response } from "express";
import express from "express";
import pg from "pg";

const { Pool } = pg;
const pool = new Pool({
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: Number(process.env.PORT_DB),
});
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/transfer", async (req: Request, res: Response) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT * FROM accounts WHERE id = $1 FOR UPDATE", [
      req.body.id,
    ]);
    await client.query(
      "UPDATE accounts SET balance = balance +$2 WHERE id = $1",
      [req.body.id, req.body.amount],
    );
    await client.query(
      "UPDATE accounts SET balance = balance -$2 WHERE id = 2",
      [req.body.amount],
    );
    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error occurred while starting transaction:", err);
  } finally {
    client.release();
    res.status(200).json({ message: "Transaction completed successfully" });
  }
});
