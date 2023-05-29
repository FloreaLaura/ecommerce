import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import { cartReducer } from './reducers/cartReducers';
// import {
//   orderCreateReducer,
//   orderDeleteReducer,
//   orderDeliverReducer,
//   orderDetailsReducer,
//   orderListReducer,
//   orderMineListReducer,
//   orderPayReducer,
//   orderSummaryReducer,
// } from './reducers/orderReducers';
// import {
//   productCategoryListReducer,
//   productCreateReducer,
//   productDeleteReducer,
//   productDetailsReducer,
//   productListReducer,
//   productReviewCreateReducer,
//   productUpdateReducer,
// } from './reducers/productReducers';
// import {
//   userAddressMapReducer,
//   userDeleteReducer,
//   userDetailsReducer,
//   userListReducer,
//   userRegisterReducer,
//   userSigninReducer,
//   userTopSellerListReducer,
//   userUpdateProfileReducer,
//   userUpdateReducer,
// } from './reducers/userReducers';

const initialState = {
  fullBox: false,
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo'))
    : null,

  cart: {
    shippingAddress: localStorage.getItem('shippingAddress')
      ? JSON.parse(localStorage.getItem('shippingAddress'))
      : { location: {} },
    paymentMethod: localStorage.getItem('paymentMethod')
      ? localStorage.getItem('paymentMethod')
      : '',
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
};
// const reducer = combineReducers({
//   productList: productListReducer,
//   productDetails: productDetailsReducer,
//   cart: cartReducer,
//   userSignin: userSigninReducer,
//   userRegister: userRegisterReducer,
//   orderCreate: orderCreateReducer,
//   orderDetails: orderDetailsReducer,
//   orderPay: orderPayReducer,
//   orderMineList: orderMineListReducer,
//   userDetails: userDetailsReducer,
//   userUpdateProfile: userUpdateProfileReducer,
//   userUpdate: userUpdateReducer,
//   productCreate: productCreateReducer,
//   productUpdate: productUpdateReducer,
//   productDelete: productDeleteReducer,
//   orderList: orderListReducer,
//   orderDelete: orderDeleteReducer,
//   orderDeliver: orderDeliverReducer,
//   userList: userListReducer,
//   userDelete: userDeleteReducer,
//   userTopSellersList: userTopSellerListReducer,
//   productCategoryList: productCategoryListReducer,
//   productReviewCreate: productReviewCreateReducer,
//   userAddressMap: userAddressMapReducer,
//   orderSummary: orderSummaryReducer,
// });

function reducer(state, action) {
  switch (action.type) {
    case 'SET_FULLBOX_ON':
      return { ...state, fullBox: true };
    case 'SET_FULLBOX_OFF':
      return { ...state, fullBox: false };

    case 'CART_ADD_ITEM':
      // add to cart
      const newItem = action.payload;
      const existItem = state.cart.cartItems.find(
        (item) => item._id === newItem._id
      );
      const cartItems = existItem
        ? state.cart.cartItems.map((item) =>
            item._id === existItem._id ? newItem : item
          )
        : [...state.cart.cartItems, newItem];
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    case 'CART_REMOVE_ITEM': {
      const cartItems = state.cart.cartItems.filter(
        (item) => item._id !== action.payload._id
      );
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      return { ...state, cart: { ...state.cart, cartItems } };
    }
    case 'CART_CLEAR':
      return { ...state, cart: { ...state.cart, cartItems: [] } };

    case 'USER_SIGNIN':
      return { ...state, userInfo: action.payload };
    case 'USER_SIGNOUT':
      return {
        ...state,
        userInfo: null,
        cart: {
          cartItems: [],
          shippingAddress: {},
          paymentMethod: '',
        },
      };
    case 'SAVE_SHIPPING_ADDRESS':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: action.payload,
        },
      };
    case 'SAVE_SHIPPING_ADDRESS_MAP_LOCATION':
      return {
        ...state,
        cart: {
          ...state.cart,
          shippingAddress: {
            ...state.cart.shippingAddress,
            location: action.payload,
          },
        },
      };

    case 'SAVE_PAYMENT_METHOD':
      return {
        ...state,
        cart: { ...state.cart, paymentMethod: action.payload },
      };
    default:
      return state;
  }
}
const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(
  reducer,
  initialState,
  composeEnhancer(applyMiddleware(thunk))
);

export default store;
