//types required for addTransactionService.ts
export interface AddTransactionFormValues {
  Date: string;
  Description: string;
  Amount: number;
  Currency: string;
}

// types required for uploadTransactionService.ts
export interface TransactionRow {
  Date: string; // Raw date from the CSV (to be converted to Date)
  Description: string; // Matches the entity's "descripition" field
  Amount: string; // Raw amount from the CSV (to be converted to a number)
  Currency: string; // Matches the entity's "currency" field
  AmountINR: string; // Raw amount from the CSV (to be converted to a number)
}

// Define types for the upload response
export interface UploadResult {
  message: string;
  transactionsSaved: number;
  duplicates: Array<{
    Date: string;
    Description: string;
    Amount: string;
    Currency: string;
    AmountINR: string;
  }>;
  schemaErrors: Array<{
    row: Record<string, string>;
    message: string;
  }>;
}

//types for the UploadCSV
export interface UploadResult {
  message: string;
  transactionsSaved: number;
  duplicates: TransactionRow[];
  schemaErrors: Array<{
    row: Record<string, string>;
    message: string;
  }>;
}

export interface Transaction {
  id: number;
  Date: string;
  Description: string;
  Amount: number;
  Currency: string;
  AmountINR?: number;
}

//types for the ErrorReport
export interface SchemaError {
  row: {
    Date: string;
    Description: string;
    Amount: string;
    Currency: string;
  };
  message: string;
}
export interface ErrorReport {
  Date?: string;
  Description?: string;
  Amount?: string | number;
  Currency?: string;
  AmountINR?: string;
  Error: string;
}
