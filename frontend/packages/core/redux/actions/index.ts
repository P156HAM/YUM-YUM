import { WontonItem, DipItem } from "@zocom/types";
import { createAction } from "@reduxjs/toolkit";

// Use action creators provided by Redux Toolkit
export const addItem = createAction(
  "ADD_TO_CART",
  (item: WontonItem | DipItem, itemType: "wonton" | "dip") => ({
    payload: { item, itemType },
  })
);

export const decrease = createAction(
  "DECREASE",
  (item: WontonItem | DipItem, itemType: "wonton" | "dip") => ({
    payload: { item, itemType },
  })
);

export const increase = createAction(
  "INCREASE",
  (item: WontonItem | DipItem, itemType: "wonton" | "dip") => ({
    payload: { item, itemType },
  })
);

export const clearCart = createAction("CLEAR_CART");
