import type { Book } from "../models/book.ts";

export type BooksProvider = {
  getBooks: () => Book[];
};

export type ApiBooksProvider = {
  getBooks: () => Book[];
};
