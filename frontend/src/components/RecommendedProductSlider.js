import axios from 'axios';
import { useContext } from 'react';
import { Store } from '../Store';
import React from 'react';
import { useEffect, useReducer, useState } from 'react';
import { getError } from '../utils';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import RecProduct from './RecProductCard';

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 3000 },
    items: 5,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1024 },
    items: 6,
    // partialVisibilityGutter:40,
  },
  tablet: {
    breakpoint: { max: 1024, min: 464 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 464, min: 0 },
    items: 1,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, myOrders: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};
const oItemOrderByQt = [];

function RecommendedProductSlider(products) {
  const { state } = useContext(Store);
  const { userInfo } = state;
  let recProducts = [];
  const [{ loading, error, myOrders }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
  });
  useEffect(() => {
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const { data } = await axios.get(
          `/api/orders/myOrders`,

          { headers: { Authorization: `Bearer ${userInfo.token}` } }
        );

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (error) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(error),
        });
      }
    };
    fetchData();
  }, [userInfo]);
  let orderedItems = [];
  let orders = [];
  let itemOrderByQt = [];
  let uniqueItems = [];
  if (myOrders) {
    myOrders.map((order) => orders.push(order.orderItems));

    for (let i in orders) {
      for (let j in orders[i]) {
        orderedItems.push(orders[i][j]);
      }
    }
    uniqueItems = [...new Set(orderedItems.map((item) => item.name))];

    for (let i of uniqueItems) {
      let body = orderedItems.filter((el) => el.name === i);
      let qt = 0;
      for (let j of body) {
        qt += j.quantity;
      }
      itemOrderByQt.push({ name: i, quantity: qt, image: orderedItems.image });
      itemOrderByQt.sort((a, b) => b.quantity - a.quantity);
    }
  }

  if (recProducts.length < 12) {
    for (let i of itemOrderByQt) {
      for (let j of products.products) {
        if (i.name === j.name && j.countInStock > 0) {
          recProducts.push(j);
        }
      }
    }
    products.products.sort((a, b) => b.rating - a.rating);
    for (let i of products.products) {
      if (!uniqueItems.includes(i.name) && i.countInStock > 0) {
        recProducts.push(i);
      }
    }
  }
  return (
    <div className="recSlide">
      <Carousel responsive={responsive}>
        {recProducts.map((product, index) => (
          <div className="recCard" key={index}>
            <RecProduct className="recCard" product={product}></RecProduct>
          </div>
        ))}
      </Carousel>
    </div>
  );
}

export default RecommendedProductSlider;
