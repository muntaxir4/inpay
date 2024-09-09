"use client";
import { useRecoilState } from "recoil";
import { Button } from "./ui/button";
import { currencyState } from "@/store/atoms";
import { useEffect, useState } from "react";
import { currencies, Currency } from "@/store/Singleton";

export default function CurrencySelect() {
  const [currency, setCurrency] = useRecoilState(currencyState);
  const [selected, setSelected] = useState(currency.id ?? currencies["INR"].id);

  function changeCurrency(currencyName: Currency) {
    setCurrency(currencies[currencyName]);
    setSelected(currencies[currencyName].id);
    localStorage?.setItem("currency", currencyName);
  }

  useEffect(() => {
    const savedCurrency =
      (localStorage?.getItem("currency") as Currency | null) ?? "INR";
    setCurrency(currencies[savedCurrency]);
    setSelected(currencies[savedCurrency].id);
  }, []);

  return (
    <div className="grid grid-cols-3 mb-4 border rounded-full">
      <Button
        variant={selected === 0 ? "default" : "ghost"}
        onClick={() => changeCurrency("INR")}
        className="h-fit py-0.5 rounded-s-full"
      >
        INR
      </Button>
      <Button
        variant={selected === 1 ? "default" : "ghost"}
        onClick={() => changeCurrency("USD")}
        className="h-fit py-0.5 rounded-none"
      >
        USD
      </Button>
      <Button
        variant={selected === 2 ? "default" : "ghost"}
        onClick={() => changeCurrency("AED")}
        className="h-fit py-0.5 rounded-e-full"
      >
        AED
      </Button>
    </div>
  );
}
