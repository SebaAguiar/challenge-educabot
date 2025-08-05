import { Book } from "./book";

export type MetricsResponse = {
  mean_units_sold: number;
  cheapest_book: Book | null;
  books_written_by_author: Book[];
};
