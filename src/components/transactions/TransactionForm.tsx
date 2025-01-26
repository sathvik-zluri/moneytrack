import React from "react";
import { Form, Input, Select, FormInstance } from "antd";
import { AddTransactionFormValues } from "../../types";
import { currencies } from "../../constants/currencies";

interface TransactionFormProps {
  form: FormInstance;
  onFinish: (values: AddTransactionFormValues) => void;
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  form,
  onFinish,
}) => {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      className="w-full max-w-md mx-auto"
    >
      <Form.Item label="Date" name="Date" rules={[{ required: true }]}>
        <Input type="date" className="w-full" />
      </Form.Item>
      <Form.Item
        label="Description"
        name="Description"
        rules={[{ required: true }]}
      >
        <Input type="text" placeholder="Enter description" className="w-full" />
      </Form.Item>
      <Form.Item label="Amount" name="Amount" rules={[{ required: true }]}>
        <Input type="number" placeholder="Enter amount" className="w-full" />
      </Form.Item>
      <Form.Item label="Currency" name="Currency" rules={[{ required: true }]}>
        <Select placeholder="Select currency" className="w-full">
          {currencies.map((currency) => (
            <Select.Option key={currency.code} value={currency.code}>
              {`${currency.code} - ${currency.name}`}
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <div className="flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          SAVE
        </button>
      </div>
    </Form>
  );
};
