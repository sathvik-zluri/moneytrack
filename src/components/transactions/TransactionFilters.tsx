import React from "react";
import { Select, DatePicker, Button } from "antd";
import {
  ExportOutlined,
  UploadOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";

const { RangePicker } = DatePicker;

interface TransactionFiltersProps {
  frequency: string;
  setFrequency: (value: string) => void;
  selectedDate: [Dayjs | null, Dayjs | null] | null;
  setSelectedDate: (dates: [Dayjs | null, Dayjs | null] | null) => void;
  onExport: () => void;
  onUpload: () => void;
  onAdd: () => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  frequency,
  setFrequency,
  selectedDate,
  setSelectedDate,
  onExport,
  onUpload,
  onAdd,
}) => {
  return (
    <div className="flex justify-between items-start p-4 bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
      <div className="space-y-2">
        <h6 className="font-medium text-gray-700">Select Frequency</h6>
        <div className="flex gap-4">
          <Select
            value={frequency}
            onChange={(values) => setFrequency(values)}
            className="w-40"
          >
            <Select.Option value="7">Last 1 Week</Select.Option>
            <Select.Option value="30">Last 1 Month</Select.Option>
            <Select.Option value="365">Last 1 Year</Select.Option>
            <Select.Option value="custom">Date Range</Select.Option>
          </Select>
          {frequency === "custom" && (
            <RangePicker
              value={selectedDate}
              onChange={(values) => setSelectedDate(values)}
              data-testid="range-picker"
              inputReadOnly
            />
          )}
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="primary" icon={<ExportOutlined />} onClick={onExport}>
          Export CSV
        </Button>
        <Button type="primary" icon={<UploadOutlined />} onClick={onUpload}>
          Upload CSV
        </Button>
        <Button
          type="primary"
          icon={<PlusSquareOutlined />}
          onClick={onAdd}
          data-testid="add-transaction-button"
        >
          Add Transaction
        </Button>
      </div>
    </div>
  );
};
