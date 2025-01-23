import axios from "axios";
import { AddTransactionFormValues, UploadResult } from "../types";
import type { Dayjs } from "dayjs";

const BASE_API_URL = "http://13.233.160.70:5000/api/v1/txns";

const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
  timeout: 50000,
});

export const getTransactions = async (
  page: number,
  limit: number,
  sort: "asc" | "desc",
  frequency: string,
  selectedDate: [Dayjs | null, Dayjs | null] | null
) => {
  const params: {
    page: number;
    limit: number;
    sort: "asc" | "desc";
    frequency?: string;
    startDate?: string;
    endDate?: string;
  } = {
    page,
    limit,
    sort,
  };

  if (frequency !== "custom") {
    params.frequency = frequency;
  } else if (selectedDate) {
    params.startDate = selectedDate[0]?.format("YYYY-MM-DD");
    params.endDate = selectedDate[1]?.format("YYYY-MM-DD");
  }

  const response = await axiosInstance.get("/list", { params });
  return response.data;
};

export const addTransaction = async (transaction: AddTransactionFormValues) => {
  const response = await axiosInstance.post("/add", transaction);
  return response.data; // Success message and added transaction
};

export const updateTransaction = async (
  id: number,
  transaction: {
    Date: string;
    Description: string;
    Amount: number;
    Currency: string;
  }
) => {
  const response = await axiosInstance.put(`/update/${id}`, transaction);
  return response.data; // Success message and updated transaction
};

export const deleteTransaction = async (id: number) => {
  const response = await axiosInstance.delete(`/delete/${id}`);
  return response.data;
};

export const uploadTransactions = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post("/uploadcsv", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data; // Upload results
};
