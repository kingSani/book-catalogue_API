import type { Request, Response } from "express";
const express = require("express");
const app = express();
app.use(express.json());
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
  res.status(200).json(books);
});
app.get("/books/:id", (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ Error: "Invalid book ID" });
  }
  const book = books.find((b) => b.id === bookId);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ Error: "Book not found" });
  }
});
app.get("/books/author", (req: Request, res: Response) => {
  const authorName = req.params.author;
  const book = books.find((b) => b.author === authorName);
  if (book) {
    res.status(200).json(book);
  } else {
    res.status(404).json({ Error: "Book not found" });
  }
});
app.post("/books", (req: Request, res: Response) => {
  const bookId: number = books.length + 1;
  if (
    typeof req.body.name !== "string" ||
    typeof req.body.author !== "string"
  ) {
    res.status(400).json({ Error: "Invalid book data" });
    return;
  }
  const bookName: string = req.body.name;
  const newBook: Book = {
    name: bookName,
    id: bookId,
    author: req.body.author,
  };
  books.push(newBook);
  res.status(201).json(newBook);
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
  if (book) {
    const updatedBook = {
      ...book,
      name: req.body.name,
      author: req.body.author,
    };
    const updatedBooks = books.map((book) => {
      bookId === book.id ? updatedBook : book;
    });
    res.status(200).json(updatedBooks);
  } else {
    res.status(404).json({ Error: "Book not found" });
  }
});
app.delete("/books/:id", (req: Request, res: Response) => {
  const bookId = Number(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ Error: "Invalid book ID" });
  }

  const index = books.findIndex((b) => b.id === bookId);
  if (index !== -1) {
    books.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ Error: "Book not found" });
  }
});
app.use(express.urlencoded({ extended: true }));
// const usersRouter = require("./routes/users");
// app.use("/users", usersRouter);

// function logger(req, res, next) {
//   console.log(req.originalUrl);
//   next();
// }
// app.use(logger);

app.listen(3000);
