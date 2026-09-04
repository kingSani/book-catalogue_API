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
app.set("view engine", "ejs");
type Book = {
  book_name: string;
  id: number;
  author_id: number;
  pages: number;
};
type Author = {
  author_name: string;
  id: number;
  best_seller: boolean;
};

app.get("/books", (req: Request, res: Response) => {
  pool.query(
    "SELECT * FROM Books LEFT JOIN Authors ON Books.author_id = Authors.id",
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ Error: "Internal Server Error" });
      } else {
        res.status(200).json(result.rows);
      }
    },
  );
});
app.get("/books/:id", (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ Error: "Invalid book ID" });
  }

  pool.query(
    "SELECT * FROM Books LEFT JOIN Authors ON Books.author_id = Authors.id WHERE Books.id = $1",
    [bookId],
    (err, result) => {
      if (err) {
        res.status(500).json({ Error: "Internal Server Error" });
      } else if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ Error: "Book not found" });
      }
    },
  );
});
app.get("/authors/:id", (req: Request, res: Response) => {
  const authorId = Number(req.params.id);
  if (isNaN(authorId)) {
    return res.status(400).json({ Error: "Invalid author ID" });
  }

  pool.query(
    "SELECT * FROM Authors WHERE id = $1",
    [authorId],
    (err, result) => {
      if (err) {
        res.status(500).json({ Error: "Internal Server Error" });
      } else if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ Error: "Author not found" });
      }
    },
  );
});
app.get("/authors", (req: Request, res: Response) => {
  pool.query(
    "SELECT * FROM Authors",

    (err, result) => {
      if (err) {
        res.status(500).json({ Error: "Internal Server Error" });
      } else if (result.rows.length > 0) {
        res.status(200).json(result.rows);
      } else {
        res.status(404).json({ Error: "Author not found" });
      }
    },
  );
});
app.post("/authors", (req: Request, res: Response) => {
  if (typeof req.body.name !== "string") {
    res.status(400).json({ Error: "Invalid author data" });
    return;
  }
  const authorName: string = req.body.name;

  pool.query(
    "INSERT INTO Authors (author_name, best_seller) VALUES ($1, $2) RETURNING *",
    [authorName, req.body.best_seller],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ Error: "Internal Server Error" });
      } else {
        const newAuthor: Author = result.rows[0];
        res.status(201).json(newAuthor);
      }
    },
  );
});
app.post("/books", (req: Request, res: Response) => {
  if (
    typeof req.body.name !== "string" ||
    typeof req.body.author_id !== "number"
  ) {
    res.status(400).json({ Error: "Invalid book data" });
    return;
  }
  const bookName: string = req.body.name;
  const authorId: number = req.body.author_id;
  const pages: number = req.body.pages;
  pool.query(
    "INSERT INTO Books (book_name, author_id, pages) VALUES ($1, $2, $3) RETURNING *",
    [bookName, authorId, pages],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ Error: "Internal Server Error" });
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
    typeof req.body.author_id !== "number" ||
    typeof req.body.pages !== "number"
  ) {
    res.status(400).json({ Error: "Invalid book data" });
    return;
  }

  pool.query(
    "UPDATE Books SET book_name = $1, author_id = $2 WHERE id = $3 RETURNING *",
    [req.body.name, req.body.author_id, bookId],
    (err, result) => {
      if (err) {
        console.error("Error executing query:", err);
        res.status(500).json({ Error: "Internal Server Error" });
      } else if (result.rows.length > 0) {
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

  pool.query(
    "DELETE FROM Books WHERE id = $1 RETURNING *",
    [bookId],
    (err, result) => {
      if (err) {
        res.status(500).json({ Error: "Internal Server Error" });
      } else if (result.rows.length > 0) {
        res.status(200).json(result.rows[0]);
      } else {
        res.status(404).json({ Error: "Book not found" });
      }
    },
  );
});

app.listen(process.env.PORT || 3000);
