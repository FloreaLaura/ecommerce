import { useEffect, useReducer, useState, useRef } from 'react';
import axios from 'axios';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Product from '../components/Product';
import { Helmet } from 'react-helmet-async';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import RecommendedProductSlider from '../components/RecommendedProductSlider';
import 'react-multi-carousel/lib/styles.css';
import socketIOClient from 'socket.io-client';
import { useSelector } from 'react-redux';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, products: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

let allUsers = [];
let allMessages = [];
let allSelectedUser = {};
const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:4000'
    : window.location.host;

function HomeScreen() {
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const uiMessagesRef = useRef(null);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const userSignin = useSelector((state) => state.userInfo);
  console.log(userSignin);
  const userInfo = userSignin;
  console.log(userInfo);

  const [{ loading, error, products }, dispatch] = useReducer(reducer, {
    products: [],
    loading: true,
    error: '',
  });
  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
    const fetchData = async () => {
      dispatch({ type: 'FETCH_REQUEST' });
      try {
        const result = await axios.get('/api/products');
        dispatch({ type: 'FETCH_SUCCESS', payload: result.data });
      } catch (err) {
        dispatch({ type: 'FETCH_FAIL', payload: err.message });
      }
    };
    fetchData();
  }, []);

  if (!socket) {
    const sk = socketIOClient(ENDPOINT);
    setSocket(sk);
    sk.emit('onLogin', {
      _id: userInfo._id,
      name: userInfo.name,
      isAdmin: userInfo.isAdmin,
    });
    sk.on('message', (data) => {
      if (allSelectedUser._id === data._id) {
        allMessages = [...allMessages, data];
      } else {
        const existUser = allUsers.find((user) => user._id === data._id);
        if (existUser) {
          allUsers = allUsers.map((user) =>
            user._id === existUser._id ? { ...user, unread: true } : user
          );
          setUsers(allUsers);
        }
      }
      setMessages(allMessages);
    });
  }
  return (
    <div>
      <Helmet>
        <title>NaturShop</title>
      </Helmet>
      <h3>PRODUSE RECOMANDATE</h3>
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <RecommendedProductSlider
          products={products}
        ></RecommendedProductSlider>
      )}

      <h3>PRODUSE</h3>
      <div className="products">
        {loading ? (
          <LoadingBox />
        ) : error ? (
          <MessageBox variant="danger">{error}</MessageBox>
        ) : (
          <Row>
            {products.map((product) => (
              <Col key={product.slug} sm={6} md={4} lg={2} className="mb-3">
                <Product product={product}></Product>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
}
export default HomeScreen;
