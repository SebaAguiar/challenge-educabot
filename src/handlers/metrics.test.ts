import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getMetrics } from "./metrics";
import type { Request, Response } from "express";
import { apiBooksProvider } from "../repositories/apiBooksProvider";
import type { Book } from "../models/book";
import type { MetricsResponse } from "../models/metrics";

// Mock the entire module to control the apiBooksProvider behavior
vi.mock("../repositories/apiBooksProvider", () => ({
  apiBooksProvider: {
    getBooks: vi.fn(),
  },
}));

describe("getMetrics", () => {
  // Mock data for our tests
  const mockBooks: Book[] = [
    { id: 1, name: "Book 1", author: "Author 1", unitsSold: 100, price: 20 },
    { id: 2, name: "Book 2", author: "Author 2", unitsSold: 200, price: 15 },
    { id: 3, name: "Book 3", author: "Author 1", unitsSold: 300, price: 25 },
  ];

  // Define types for our mocked Express objects to avoid using 'any'
  type MockResponse = Partial<Response<MetricsResponse | { error: string }>>;
  type MockRequest = Partial<Request<{}, {}, {}, { author?: string }>>;

  let mockReq: MockRequest;
  let mockRes: MockResponse;
  let jsonMock: vi.Mock;
  let statusMock: vi.Mock;

  beforeEach(() => {
    // Reset mocks before each test
    jsonMock = vi.fn();
    // Chain the mocks for res.status().json()
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    mockRes = {
      status: statusMock,
    };
    mockReq = {
      query: {},
    };
  });

  afterEach(() => {
    // Clear all mocks after each test to ensure isolation
    vi.clearAllMocks();
  });

  it("should return metrics but with an empty author list when no author query is provided", async () => {
    // Arrange: Mock the provider to return our book data
    (apiBooksProvider.getBooks as vi.Mock).mockResolvedValue(mockBooks);

    // Act: Call the handler, casting mocks to the full Express types
    await getMetrics(mockReq as Request, mockRes as Response);

    // Assert: Check that the correct data was returned
    expect(apiBooksProvider.getBooks).toHaveBeenCalledOnce();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      mean_units_sold: 200,
      cheapest_book: mockBooks[1],
      books_written_by_author: [], // Empty because no author was queried
    });
  });

  it("should return metrics including books by the specified author", async () => {
    // Arrange: Set the author query and mock the provider
    mockReq.query = { author: "Author 1" };
    (apiBooksProvider.getBooks as vi.Mock).mockResolvedValue(mockBooks);

    // Act: Call the handler
    await getMetrics(mockReq as Request, mockRes as Response);

    // Assert: Check for the correct data, including the filtered books
    expect(apiBooksProvider.getBooks).toHaveBeenCalledOnce();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      mean_units_sold: 200,
      cheapest_book: mockBooks[1],
      books_written_by_author: [mockBooks[0], mockBooks[2]],
    });
  });

  it("should return zeroed/null metrics when no books are available", async () => {
    // Arrange: Mock the provider to return an empty array
    (apiBooksProvider.getBooks as vi.Mock).mockResolvedValue([]);

    // Act: Call the handler
    await getMetrics(mockReq as Request, mockRes as Response);

    // Assert: Check for the specific response when no books are found
    expect(apiBooksProvider.getBooks).toHaveBeenCalledOnce();
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({
      mean_units_sold: 0,
      cheapest_book: null,
      books_written_by_author: [],
    });
  });

  it("should handle errors and return a 500 status", async () => {
    // Arrange: Mock the provider to throw an error
    const errorMessage = "An internal server error occurred";
    (apiBooksProvider.getBooks as vi.Mock).mockRejectedValue(
      new Error("Database connection failed"),
    );

    // Act: Call the handler
    await getMetrics(mockReq as Request, mockRes as Response);

    // Assert: Check that the error is handled gracefully
    expect(apiBooksProvider.getBooks).toHaveBeenCalledOnce();
    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({ error: errorMessage });
  });
});
