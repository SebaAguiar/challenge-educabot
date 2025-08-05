import type { Book } from "../models/book";

export const getMeanUnitsSold = (books: Book[]): number => {
  if (books.length === 0) return 0;
  const totalUnitsSold = books.reduce((sum, book) => sum + book.unitsSold, 0);
  return totalUnitsSold / books.length;
};

export const getCheapestBook = (books: Book[]): Book | null => {
  if (books.length === 0) return null;
  return books.reduce((cheapest, book) => {
    return book.price < cheapest.price ? book : cheapest;
  }, books[0]);
};

export const getBooksWrittenByAuthor = (
  books: Book[],
  author: string,
): Book[] => {
  return books.filter(
    (book) => book.author.toLowerCase() === author.toLowerCase(),
  );
};
