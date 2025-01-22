import React from "react";
import { Modal, FormInstance } from "antd";
import { TransactionForm } from "./TransactionForm";
import { CSVUpload } from "../CSVUpload";
import { Transaction, AddTransactionFormValues } from "../../types";

export interface TransactionModalsProps {
  showModal: boolean;
  showUploadModal: boolean;
  editable: Transaction | null;
  form: FormInstance;
  loading: boolean;
  onModalCancel: () => void;
  onUploadModalCancel: () => void;
  onFormSubmit: (values: AddTransactionFormValues) => void;
  onFileUpload: (file: File) => Promise<void>;
}

export const TransactionModals: React.FC<TransactionModalsProps> = ({
  showModal,
  showUploadModal,
  editable,
  form,
  loading,
  onModalCancel,
  onUploadModalCancel,
  onFormSubmit,
  onFileUpload,
}) => {
  return (
    <>
      <Modal
        title={editable ? "Edit Transaction" : "Add Transaction"}
        open={showModal}
        onCancel={onModalCancel}
        footer={false}
      >
        <div aria-label="transaction-form">
          <TransactionForm form={form} onFinish={onFormSubmit} />
        </div>
      </Modal>

      <Modal
        title="Upload Transactions"
        open={showUploadModal}
        onCancel={onUploadModalCancel}
        footer={null}
        width={600}
        centered
      >
        <CSVUpload onUpload={onFileUpload} loading={loading} />
      </Modal>
    </>
  );
};
