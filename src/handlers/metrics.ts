import type { Request, Response } from "express";
import { apiBooksProvider } from "../repositories/apiBooksProvider";
import {
  getMeanUnitsSold,
  getCheapestBook,
  getBooksWrittenByAuthor,
} from "../services/metrics";
import { MetricsResponse } from "../models/metrics";
import { Book } from "../models/book";

interface GetMetricsQuery {
  author?: string;
}

export const getMetrics = async (
  req: Request<{}, {}, {}, GetMetricsQuery>,
  res: Response<MetricsResponse | { error: string }>,
) => {
  try {
    const { author } = req.query;

    const books: Book[] = await apiBooksProvider.getBooks();

    if (books.length === 0) {
      return res.status(200).json({
        mean_units_sold: 0,
        cheapest_book: null,
        books_written_by_author: [],
      });
    }

    const meanUnitsSold = getMeanUnitsSold(books);
    const cheapestBook = getCheapestBook(books);
    const booksWrittenByAuthor = author
      ? getBooksWrittenByAuthor(books, author)
      : [];

    return res.status(200).json({
      mean_units_sold: meanUnitsSold,
      cheapest_book: cheapestBook,
      books_written_by_author: booksWrittenByAuthor,
    });
  } catch (error) {
    console.error("Error in getMetrics handler:", error);
    res.status(500).json({ error: "An internal server error occurred" });
  }
};
