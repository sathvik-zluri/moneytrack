import React, { useState } from "react";
import { Pagination, Table, Button, message, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../styles/Table.css";
import { Transaction } from "../../types";

interface TransactionTableProps {
  transactions: Transaction[];
  setEditable: (record: Transaction) => void;
  setShowModal: (show: boolean) => void;
  handleDelete: (id: number) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  totalCount: number;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  setEditable,
  setShowModal,
  handleDelete,
  page,
  setPage,
  limit,
  setLimit,
  totalCount,
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<number | null>(
    null
  );

  const handleBatchDelete = async () => {
    try {
      for (const id of selectedRowKeys) {
        await handleDelete(Number(id));
      }
      message.success("Selected transactions deleted successfully!");
      setSelectedRowKeys([]);
    } catch (error) {
      console.error("Error deleting transactions", error);
      message.error("Failed to delete selected transactions.");
    }
  };

  const showDeleteConfirm = (id: number) => {
    setTransactionToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = () => {
    if (transactionToDelete !== null) {
      handleDelete(transactionToDelete);
      setDeleteModalVisible(false);
      setTransactionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalVisible(false);
    setTransactionToDelete(null);
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "Date",
      key: "Date",
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
    },
    {
      title: "Currency",
      dataIndex: "Currency",
      key: "Currency",
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      key: "Amount",
    },
    {
      title: "INR",
      dataIndex: "AmountINR",
      key: "AmountINR",
    },
    {
      title: "Actions",
      render: (_text: string, record: Transaction) => (
        <div className="flex items-center space-x-4">
          <EditOutlined
            onClick={() => {
              setEditable(record);
              setShowModal(true);
            }}
            className="text-blue-400 text-xl cursor-pointer hover:text-blue-700 transition-colors"
            aria-label="edit"
          />
          <DeleteOutlined
            onClick={() => showDeleteConfirm(record.id)}
            className="text-red-400 text-xl cursor-pointer hover:text-red-700 transition-colors"
            aria-label="delete"
          />
        </div>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => setSelectedRowKeys(selectedKeys),
    data_testid: "row-selection",
  };

  const onPageChange = (newPage: number, newSize: number) => {
    setPage(newPage);
    setLimit(newSize);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="mb-4 flex justify-between items-center">
        <Button
          type="primary"
          danger
          onClick={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          Delete Selected
        </Button>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        pagination={false}
        className="border border-gray-200 rounded-lg"
        tableLayout="auto"
        bordered
        summary={() => (
          <Table.Summary>
            <Table.Summary.Row>
              <Table.Summary.Cell
                index={0}
                colSpan={6}
                className="summary-cell"
              >
                <strong>Total Transactions: {totalCount}</strong>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          </Table.Summary>
        )}
        rowClassName="table-row"
      />

      <div className="mt-6 flex justify-center">
        <Pagination
          showSizeChanger
          current={page}
          pageSize={limit}
          total={totalCount}
          onChange={onPageChange}
          onShowSizeChange={onPageChange}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
          pageSizeOptions={["5", "10", "20", "50"]}
          className="border border-gray-200 rounded-lg bg-white px-4 py-2 shadow-sm"
          aria-label="pagination"
        />
      </div>

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Yes, delete"
        cancelText="No, cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this transaction?</p>
      </Modal>
    </div>
  );
};

export default TransactionTable;
