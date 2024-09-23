import { createReducer, PayloadAction } from "@reduxjs/toolkit";
import { MenuList, WontonItem, DipItem } from "@zocom/types";
import { addItem, increase, decrease, clearCart } from "@zocom/cart-actions";

interface CartState {
  menuList: MenuList;
}

const initialState: CartState = {
  menuList: {
    wonton: [],
    dip: [],
  },
};

// Use the createReducer helper function to simplify the reducer
const cartReducer = createReducer(initialState, (builder) => {
  builder
    .addCase(
      addItem,
      (
        state,
        action: PayloadAction<{
          item: WontonItem | DipItem;
          itemType: "wonton" | "dip";
        }>
      ) => {
        const { item, itemType } = action.payload;
        const existingItems = state.menuList[itemType];
        const existingItemIndex = existingItems.findIndex(
          (i) => i.name === item.name
        );

        if (existingItemIndex !== -1) {
          // Update existing item's quantity
          existingItems[existingItemIndex].quantity += 1;
        } else {
          // Add new item with quantity 1
          existingItems.push({ ...item, quantity: 1 });
        }
      }
    )
    .addCase(
      increase,
      (
        state,
        action: PayloadAction<{
          item: WontonItem | DipItem;
          itemType: "wonton" | "dip";
        }>
      ) => {
        const { item, itemType } = action.payload;
        const existingItems = state.menuList[itemType];
        const index = existingItems.findIndex((i) => i.name === item.name);
        if (index !== -1) {
          existingItems[index].quantity += 1;
        }
      }
    )
    .addCase(
      decrease,
      (
        state,
        action: PayloadAction<{
          item: WontonItem | DipItem;
          itemType: "wonton" | "dip";
        }>
      ) => {
        const { item, itemType } = action.payload;
        const existingItems = state.menuList[itemType];
        const index = existingItems.findIndex((i) => i.name === item.name);
        if (index !== -1) {
          const currentQuantity = existingItems[index].quantity;
          if (currentQuantity > 1) {
            existingItems[index].quantity -= 1;
          } else {
            // Remove item from the list
            existingItems.splice(index, 1);
          }
        }
      }
    )
    .addCase(clearCart, (state) => {
      state.menuList.wonton = [];
      state.menuList.dip = [];
    });
});

export default cartReducer;
