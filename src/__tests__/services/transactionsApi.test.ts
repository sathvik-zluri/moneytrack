import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactions,
  deleteData,
} from "../../services/transactionsApi";
import { axiosInstance } from "../../services/transactionsApi";
import { Dayjs } from "dayjs";
import { AddTransactionFormValues } from "../../types";
import axios from "axios";

let apiSpy;

describe("Transactions API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for getTransactions
  it("should call axiosInstance.get with correct parameters for non-custom frequency in getTransactions", async () => {
    apiSpy = jest.spyOn(axiosInstance, "get");
    apiSpy.mockResolvedValue({ data: [] });

    const page = 1;
    const limit = 10;
    const sort = "asc";
    const frequency = "monthly";
    const selectedDate = null;

    await getTransactions(page, limit, sort, frequency, selectedDate);

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith("/list", {
      params: {
        page,
        limit,
        sort,
        frequency,
      },
    });
  });

  it("should call axiosInstance.get with correct parameters for custom date range in getTransactions", async () => {
    apiSpy = jest.spyOn(axiosInstance, "get");
    apiSpy.mockResolvedValue({ data: [] });

    const page = 1;
    const limit = 10;
    const sort = "asc";
    const frequency = "custom";
    const selectedDate: [Dayjs | null, Dayjs | null] = [
      { format: () => "2023-12-01" } as Dayjs,
      { format: () => "2023-12-31" } as Dayjs,
    ];

    await getTransactions(page, limit, sort, frequency, selectedDate);

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith("/list", {
      params: {
        page,
        limit,
        sort,
        startDate: "2023-12-01",
        endDate: "2023-12-31",
      },
    });
  });

  // Test for addTransaction
  it("should call axiosInstance.post with correct data in addTransaction", async () => {
    apiSpy = jest.spyOn(axiosInstance, "post");
    apiSpy.mockResolvedValue({ data: { success: true } });

    const transaction: AddTransactionFormValues = {
      Date: "2023-12-01",
      Description: "Test Transaction",
      Amount: 100,
      Currency: "USD",
    };

    const result = await addTransaction(transaction);

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith("/add", transaction);
    expect(result).toEqual({ success: true });
  });

  // Test for updateTransaction
  it("should call axiosInstance.put with correct data in updateTransaction", async () => {
    apiSpy = jest.spyOn(axiosInstance, "put");
    apiSpy.mockResolvedValue({ data: { success: true } });

    const id = 123;
    const transaction = {
      Date: "2023-12-01",
      Description: "Updated Description",
      Amount: 200,
      Currency: "EUR",
    };

    const result = await updateTransaction(id, transaction);

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith(`/update/${id}`, transaction);
    expect(result).toEqual({ success: true });
  });

  // Test for deleteTransaction
  it("should call axiosInstance.delete with correct ID in deleteTransaction", async () => {
    apiSpy = jest.spyOn(axiosInstance, "delete");
    apiSpy.mockResolvedValue({ data: { success: true } });

    const id = 123;

    const result = await deleteTransaction(id);

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith(`/delete/${id}`);
    expect(result).toEqual({ success: true });
  });

  // Test for uploadTransactions
  it("should call axiosInstance.post with correct form data in uploadTransactions", async () => {
    apiSpy = jest.spyOn(axiosInstance, "post");
    apiSpy.mockResolvedValue({ data: { success: true } });

    const file = new File(["test content"], "test.csv", {
      type: "text/csv",
    });

    const result = await uploadTransactions(file);

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith("/uploadcsv", expect.any(FormData), {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    expect(result).toEqual({ success: true });
  });

  // Test for deleteData
  it("should call axios.delete with correct URL in deleteData", async () => {
    apiSpy = jest.spyOn(axios, "delete"); // Spy on the default Axios instance
    apiSpy.mockResolvedValue({ data: { success: true } });

    const result = await deleteData();

    expect(apiSpy).toBeCalledTimes(1);
    expect(apiSpy).toBeCalledWith(
      "https://r1s6ez777l.execute-api.ap-south-1.amazonaws.com/moneymap/api/v1/internal/delete-data"
    );
    expect(result).toEqual({ success: true });
  });
});
