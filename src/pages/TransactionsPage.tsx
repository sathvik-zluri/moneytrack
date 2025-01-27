import React, { useEffect, useState } from "react";
import { Form, message } from "antd";
import type { Dayjs } from "dayjs";
import { unparse } from "papaparse";
import { format } from "date-fns";
import { AxiosError } from "axios";

// Components
import Layout from "../components/Layout/Layout";
import Spinner from "../components/Spinner";
import TransactionTable from "../components/transactions/TransactionTable";
import { TransactionFilters } from "../components/transactions/TransactionFilters";
import { TransactionModals } from "../components/transactions/TransactionModal";

// Services
import {
  addTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  uploadTransactions,
} from "../services/transactionsApi";

// Types
import { AddTransactionFormValues, ErrorReport, Transaction } from "../types";

const TransactionsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [frequency, setFrequency] = useState("365");
  const [selectedDate, setSelectedDate] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);
  const [editable, setEditable] = useState<Transaction | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (editable) {
      const [day, month, year] = editable.Date.split("-"); // Split "09-01-2025" into parts
      const formattedDate = `${year}-${month}-${day}`; // Reorder to "2025-09-01"

      form.setFieldsValue({
        ...editable,
        Date: formattedDate,
      });
    } else {
      form.resetFields();
    }
  }, [editable, form, refreshFlag]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await getTransactions(
          page,
          limit,
          "desc",
          frequency,
          frequency === "custom" ? selectedDate : null
        );

        const formattedTransactions = response.data.map(
          (transaction: Transaction) => ({
            ...transaction,
            Date: format(new Date(transaction.Date), "dd-MM-yyyy"),
          })
        );
        setTransactions(formattedTransactions);
        setTotalCount(response.pagination.totalCount);
        setLoading(false);
        message.success(
          response?.message || "Fetched transactions successfully!"
        );
      } catch (error) {
        setLoading(false);
        if (!(error instanceof AxiosError)) {
          message.error("Failed to fetch transactions. Please try again.");
          return;
        }
        const { response, status } = error;
        if (status === 400) {
          message.error(
            response?.data?.errors || "An unexpected error occurred."
          );
        }
      }
    };

    fetchTransactions();
  }, [frequency, selectedDate, page, limit, refreshFlag]);

  const handleDelete = async (ids: number[] | number) => {
    try {
      setLoading(true);

      const idsArray = Array.isArray(ids) ? ids : [ids];
      const promises = idsArray.map((id) => deleteTransaction(id));

      const results = await Promise.allSettled(promises);
      const successfulDeletions = results.filter(
        (result) => result.status === "fulfilled"
      );
      const failedDeletions = results.filter(
        (result) => result.status === "rejected"
      );

      setLoading(false);

      if (successfulDeletions.length > 0) {
        message.success(
          `${successfulDeletions.length} transaction(s) deleted successfully!`
        );
      }

      if (failedDeletions.length > 0) {
        message.error(
          `${failedDeletions.length} transaction(s) failed to delete. Please try again.`
        );
      }

      setRefreshFlag((prev) => !prev);
    } catch (error) {
      setLoading(false);
      if (!(error instanceof AxiosError)) {
        message.error("Failed to delete transaction. Please try again.");
        return;
      }
      const { response, status } = error;
      if (status === 400) {
        message.error(response?.data?.error || "An unexpected error occurred.");
      }
    }
  };

  const handleSubmit = async (values: AddTransactionFormValues) => {
    try {
      setLoading(true);
      if (editable) {
        const response = await updateTransaction(editable.id, values);
        setLoading(false);
        message.success(
          response?.message || "Transaction updated successfully!"
        );
      } else {
        console.log(values);
        const response = await addTransaction(values);
        setLoading(false);
        message.success(response?.message || "Transaction added successfully!");
      }
      setShowModal(false);
      setEditable(null);
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      setLoading(false);
      if (!(error instanceof AxiosError)) {
        message.error("Failed to save transaction. Please try again.");
        return;
      }
      const { response, status } = error;
      if (status === 400) {
        message.error(
          response?.data?.error ||
            response?.data?.errors ||
            "An unexpected error occurred."
        );
      } else if (status === 404) {
        message.error(
          response?.data?.error ||
            response?.data?.errors ||
            "An unexpected error occurred."
        );
      } else if (status === 409) {
        message.error(
          response?.data?.error ||
            response?.data?.errors ||
            "An unexpected error occurred."
        );
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    try {
      setLoading(true);
      const response = await uploadTransactions(file);
      const {
        message: responseMessage,
        transactionsSaved,
        duplicates,
        schemaErrors,
      } = response;

      if (transactionsSaved > 0) {
        message.success(
          `${responseMessage} - ${transactionsSaved} transactions saved.`
        );
      }

      if (duplicates.length > 0 || schemaErrors.length > 0) {
        message.warning(
          `${responseMessage}. Duplicates: ${duplicates.length}, Schema Errors: ${schemaErrors.length}. Downloading error report...`
        );
        // Prepare error report data
        const errorReports: ErrorReport[] = [
          // Handle duplicates with AmountINR
          ...duplicates.map((transaction) => ({
            Date: transaction.Date,
            Description: transaction.Description,
            Amount: transaction.Amount,
            Currency: transaction.Currency,
            Error: "Duplicate transaction",
          })),
          // Handle schema errors from row data
          ...schemaErrors.map((error) => ({
            Date: error.row.Date,
            Description: error.row.Description,
            Amount: error.row.Amount,
            Currency: error.row.Currency,
            Error: error.message,
          })),
        ];

        // Generate and download error report
        downloadErrorReport(errorReports);
      }

      if (
        transactionsSaved === 0 &&
        duplicates.length === 0 &&
        schemaErrors.length === 0
      ) {
        message.info("File uploaded but no valid transactions were processed.");
      }
      setShowUploadModal(false);
      setRefreshFlag((prev) => !prev);
    } catch (error) {
      setLoading(false);
      if (!(error instanceof AxiosError)) {
        message.error("Failed to upload transactions. Please try again.");
        return;
      }
      const { response, status } = error;
      if (status === 400) {
        message.error(
          response?.data?.message || "An unexpected error occurred."
        );
      } else if (status === 404) {
        message.error(
          response?.data?.error ||
            response?.data?.errors ||
            "An unexpected error occurred."
        );
      }
    }
  };

  const downloadErrorReport = (errorReports: ErrorReport[]) => {
    const csv = unparse({
      fields: ["Date", "Description", "Amount", "Currency", "Error"],
      data: errorReports.map((report) => [
        report.Date || "",
        report.Description || "",
        report.Amount || "",
        report.Currency || "",
        report.Error,
      ]),
    });

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transaction_errors.csv";
    // Append link to the body to ensure it's part of the DOM
    document.body.appendChild(link);
    link.click();

    // Cleanup: Remove link and revoke the object URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = () => {
    const csv = unparse({
      fields: ["Date", "Description", "Amount", "Currency"],
      data: transactions.map((transaction) => [
        transaction.Date,
        transaction.Description,
        transaction.Amount,
        transaction.Currency,
      ]),
    });
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "transactions.csv";
    link.click();
  };

  return (
    <Layout>
      {loading && <Spinner />}
      <div className="p-2 sm:p-6">
        <TransactionFilters
          frequency={frequency}
          setFrequency={setFrequency}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          onExport={handleExport}
          onUpload={() => setShowUploadModal(true)}
          onAdd={() => {
            setShowModal(true);
            setEditable(null);
          }}
          aria-label="Transaction filters"
        />

        <TransactionTable
          transactions={transactions}
          setEditable={setEditable}
          setShowModal={setShowModal}
          handleDelete={handleDelete}
          page={page}
          setPage={setPage}
          limit={limit}
          setLimit={setLimit}
          totalCount={totalCount}
          aria-label="Transaction table"
        />

        <TransactionModals
          showModal={showModal}
          showUploadModal={showUploadModal}
          editable={editable}
          form={form}
          loading={loading}
          onModalCancel={() => setShowModal(false)}
          onUploadModalCancel={() => setShowUploadModal(false)}
          onFormSubmit={handleSubmit}
          onFileUpload={handleFileUpload}
          aria-label="Transaction modals"
        />
      </div>
    </Layout>
  );
};

export default TransactionsPage;
