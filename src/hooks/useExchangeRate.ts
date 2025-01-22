import { useState, useEffect } from "react";
import axios from "axios";

export const useExchangeRates = () => {
  const [exchangeRates, setExchangeRates] = useState<{ [key: string]: number }>(
    {}
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "https://api.exchangerate-api.com/v4/latest/INR"
        );
        setExchangeRates(response.data.rates);
        setError(null);
      } catch (error) {
        console.error("Error fetching exchange rates", error);
        setError("Failed to fetch exchange rates");
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  const convertToINR = (amount: number, currency: string) => {
    if (currency === "INR") return amount;
    const rate = exchangeRates[currency] || 1;
    return amount * rate;
  };

  return { exchangeRates, loading, error, convertToINR };
};
