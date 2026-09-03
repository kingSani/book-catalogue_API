import dotenv from "dotenv";
// Must be called before accessing process.env!
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
app.set("view engine", "ejs");
type Book = {
  name: string;
  id: number;
  author: string;
};

const books: Book[] = [
  { name: "Book 1", id: 1, author: "Author 1" },
  { name: "Book 2", id: 2, author: "Author 2" },
  { name: "Book 3", id: 3, author: "Author 3" },
];
app.get("/books", (req: Request, res: Response) => {
  pool.query("SELECT * FROM Books", (err, result) => {
    if (err) {
      console.error("Error executing query:", err);
      res.status(500).json({ Error: err.message, details: err });
    } else {
      res.status(200).json(result.rows);
    }
  });
});
app.get("/books/:id", (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ Error: "Invalid book ID" });
  }
  const book = books.find((b) => b.id === bookId);
  pool.query("SELECT * FROM Books WHERE id = $1", [bookId], (err, result) => {
    if (err) {
      res.status(500).json({ Error: err.message, details: err });
    } else if (result.rows.length > 0 && book) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ Error: "Book not found" });
    }
  });
});
app.get("/books/authors/:author", (req: Request, res: Response) => {
  const authorName = req.params.author;
  const book = books.find((b) => b.author === authorName);
  pool.query(
    "SELECT * FROM Books WHERE author ILIKE $1",
    [`%${authorName}%`],
    (err, result) => {
      if (err) {
        res.status(500).json({ Error: err.message, details: err });
      } else if (result.rows.length > 0 && book) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ Error: "Book not found" });
      }
    },
  );
});
app.post("/books", (req: Request, res: Response) => {
  if (
    typeof req.body.name !== "string" ||
    typeof req.body.author !== "string"
  ) {
    res.status(400).json({ Error: "Invalid book data" });
    return;
  }
  const bookName: string = req.body.name;
  const authorName: string = req.body.author;
  pool.query(
    "INSERT INTO Books (book_name, author) VALUES ($1, $2) RETURNING *",
    [bookName, authorName],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ Error: err.message, details: err });
      } else {
        const newBook: Book = result.rows[0];
        res.status(201).json(newBook);
      }
    },
  );
});
app.put("/books/:id", (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ Error: "Invalid book ID" });
  }
  if (
    typeof req.body.name !== "string" ||
    typeof req.body.author !== "string"
  ) {
    res.status(400).json({ Error: "Invalid book data" });
    return;
  }
  const book = books.find((b) => b.id === bookId);
  pool.query(
    "UPDATE Books SET book_name = $1, author = $2 WHERE id = $3 RETURNING *",
    [req.body.name, req.body.author, bookId],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ Error: err.message, details: err });
      } else if (book) {
        const newBook: Book = result.rows[0];
        res.status(201).json(newBook);
      } else {
        res.status(404).json({ Error: "Book not found" });
      }
    },
  );
});
app.delete("/books/:id", (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ Error: "Invalid book ID" });
  }

  pool.query("DELETE FROM Books WHERE id = $1", [bookId], (err, result) => {
    if (err) {
      res.status(500).json({ Error: err.message, details: err });
    } else if (result.rows.length > 0) {
      res.status(200).json(result.rows[0]);
    } else {
      res.status(404).json({ Error: "Book not found" });
    }
  });
});

// const usersRouter = require("./routes/users");
// app.use("/users", usersRouter);

// function logger(req, res, next) {
//   console.log(req.originalUrl);
//   next();
// }
// app.use(logger);

app.listen(process.env.PORT || 3000);
