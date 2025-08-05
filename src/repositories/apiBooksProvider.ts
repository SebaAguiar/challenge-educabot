import axios from "axios";
import { Book } from "../models/book";
import { BooksProvider } from "../providers/books";

const BOOKS_API_URL =
  "https://6781684b85151f714b0aa5db.mockapi.io/api/v1/books";

export const apiBooksProvider: BooksProvider = {
  getBooks: async (): Promise<Book[]> => {
    try {
      const response = await axios.get<Book[]>(BOOKS_API_URL);
      return response.data;
    } catch (error) {
      console.error("Error fetching books from external API:", error);
      return [];
    }
  },
};
