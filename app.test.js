process.env.NODE_ENV = "TEST";
const supertest = require("supertest");
const app = require("./app");
const request = require("supertest");
const db = require("./db");
const Book = require("./models/book");

beforeAll(async () => {
  await db.query("DELETE FROM books;");
  await Book.create({
    isbn: "978-3-16-148410-0",
    amazon_url:
      "https://www.youtube.com/embed/dMF5jW8Zv3g?autoplay=1&controls=1&showinfo=0&rel=0",
    author: "Scott Harrington",
    language: "English",
    pages: 1000,
    publisher: "Scotts Clearing House",
    title: "My Favorite Cat",
    year: 2023,
  });
});

describe("Book routes should work", function () {
  test("Main get route should return all books", async function () {
    const result = await request(app).get("/books");
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.text).books[0]).toEqual(
      expect.objectContaining({ author: "Scott Harrington" })
    );
  });

  test("Getting book by isbn should work", async function () {
    const result = await request(app).get("/books/978-3-16-148410-0");
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.text).book).toEqual(
      expect.objectContaining({ author: "Scott Harrington" })
    );
  });
  test("Adding a new book with valid schema should return book", async function () {
    const result = await request(app)
      .post("/books")
      .send({
        book: {
          isbn: "999-3-16-148490-0",
          amazon_url:
            "https://www.youtube.com/embed/dMF5jW8Zv3g?autoplay=1&controls=1&showinfo=9999&rel=0",
          author: "Scott Harrington",
          language: "English",
          pages: 1000,
          publisher: "Scotts Clearing House",
          title: "My Favorite Cat Part 2",
          year: 2023,
        },
      });
    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.text).book).toEqual(
      expect.objectContaining({ title: "My Favorite Cat Part 2" })
    );
  });

  test("Put request with isbn param should update matching book", async function () {
    const result = await request(app)
      .put("/books/978-3-16-148410-0")
      .send({
        book: {
          isbn: "978-3-16-148410-0",
          amazon_url:
            "https://www.youtube.com/embed/dMF5jW8Zv3g?autoplay=1&controls=1&showinfo=0&rel=0",
          author: "Scott Harrington",
          language: "English",
          pages: 9999,
          publisher: "Scotts Clearing House",
          title: "My Favorite Cat",
          year: 2023,
        },
      });
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.text).book).toEqual(
      expect.objectContaining({ pages: 9999 })
    );
  });
});

afterAll(async () => {
  await db.query("DELETE FROM books;");
  await db.end();
});
