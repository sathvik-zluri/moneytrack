import React, { useState } from "react";
import { Pagination, Table, Button, message, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import "../../styles/Table.css";
import { Transaction } from "../../types";
import DescriptionCell from "./DescriptionCell";

interface TransactionTableProps {
  transactions: Transaction[];
  setEditable: (record: Transaction) => void;
  setShowModal: (show: boolean) => void;
  handleDelete: (ids: number[] | number) => void;
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
    if (selectedRowKeys.length === 0) {
      message.warning("No transactions selected for deletion.");
      return;
    }

    Modal.confirm({
      title: "Confirm Delete",
      content: `Are you sure you want to delete ${selectedRowKeys.length} transaction(s)?`,
      okText: "Yes, delete",
      okButtonProps: { danger: true },
      cancelText: "No, cancel",
      onOk: async () => {
        await handleDelete(selectedRowKeys.map(Number));
        setSelectedRowKeys([]);
      },
    });
  };

  const showDeleteConfirm = (id: number) => {
    setTransactionToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (transactionToDelete !== null) {
      await handleDelete(transactionToDelete);
      setDeleteModalVisible(false);
      setTransactionToDelete(null);
      setSelectedRowKeys((keys) =>
        keys.filter((key) => key !== transactionToDelete)
      );
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
      width: 110,
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
      width: 250,
      render: (text: string) => <DescriptionCell text={text} />,
      className: "whitespace-normal break-words",
    },
    {
      title: "Currency",
      dataIndex: "Currency",
      key: "Currency",
      width: 100,
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      key: "Amount",
      width: 100,
    },
    {
      title: "INR",
      dataIndex: "AmountINR",
      key: "AmountINR",
      width: 100,
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      render: (_text: string, record: Transaction) => (
        <div className="flex items-center space-x-4">
          <EditOutlined
            onClick={() => {
              setEditable(record);
              setShowModal(true);
            }}
            className="text-blue-400 text-xl cursor-pointer hover:text-blue-600 transition-colors"
            aria-label="edit"
          />
          <DeleteOutlined
            onClick={() => showDeleteConfirm(record.id)}
            className="text-red-400 text-xl cursor-pointer hover:text-red-600 transition-colors"
            aria-label="delete"
          />
        </div>
      ),
      fixed: "right" as const,
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

  const showTotalText = (total: number, range: [number, number]) => (
    <div className="hidden sm:block">
      {`${range[0]}-${range[1]} of ${total}`}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-2 sm:p-6 overflow-x-auto">
      <div className="mb-4">
        <Button
          type="primary"
          danger
          onClick={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
          className="w-full sm:w-auto"
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
        scroll={{ x: "max-content" }}
        size="small"
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
        data-testid="transaction-table"
      />

      <div className="mt-6 flex justify-center">
        <div className="w-full max-w-screen-sm">
          <Pagination
            showSizeChanger
            current={page}
            pageSize={limit}
            total={totalCount}
            onChange={onPageChange}
            onShowSizeChange={onPageChange}
            showTotal={showTotalText}
            pageSizeOptions={["5", "10", "20", "50"]}
            className="flex flex-wrap justify-center items-center gap-2 border border-gray-200 rounded-lg bg-white p-2 sm:p-4"
            aria-label="pagination"
            size="small"
          />
        </div>
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
