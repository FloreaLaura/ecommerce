import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import HomeScreen from './screens/HomeScreen';
import ProductScreen from './screens/ProductScreen';
import Navbar from 'react-bootstrap/Navbar';
import Badge from 'react-bootstrap/Badge';
import Nav from 'react-bootstrap/Nav';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Container from 'react-bootstrap/Container';
import { LinkContainer } from 'react-router-bootstrap';
import { useContext, useEffect, useState } from 'react';
import { Store } from './Store';
import CartScreen from './screens/CartScreen';
import SigninScreen from './screens/SigninScreen';
import ShippingAddressScreen from './screens/ShippingAddressScreen';
import SignupScreen from './screens/SignupScreen';
import PaymentMethodScreen from './screens/PaymentMethodScreen';
import PlaceOrderScreen from './screens/PlaceOrderScreen';
import OrderScreen from './screens/OrderScreen';
import OrderHistoryScreen from './screens/OrderHistoryScreen';
import ProfileScreen from './screens/ProfileScreen';
import Button from 'react-bootstrap/Button';
import { getError } from './utils';
import axios from 'axios';
import SearchBox from './components/SearchBox';
import SearchScreen from './screens/SearchScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardScreen from './screens/DashboardScreen';
import AdminRoute from './components/AdminRoute';
import ProductListScreen from './screens/ProductListScreen';
import ProductEditScreen from './screens/ProductEditScreen';
import OrderListScreen from './screens/OrderListScreen';
import UserListScreen from './screens/UserListScreen';
import UserEditScreen from './screens/UserEditScreen';
import ForgetPasswordScreen from './screens/ForgetPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import ProductCreateScreen from './screens/ProductCreateScreen';
import ContactScreen from './screens/ContactScreen';
import MapScreen from './screens/MapScreen';
import ChatScreen from './screens/ChatScreen';
import ChatBox from './components/ChatBox';

function App() {
  const { state, dispatch: ctxDispatch } = useContext(Store);
  const { fullBox, cart, userInfo } = state;

  const signoutHandler = () => {
    ctxDispatch({ type: 'USER_SIGNOUT' });
    localStorage.removeItem('userInfo');
    localStorage.removeItem('shippingAddress');
    localStorage.removeItem('paymentMethod');
    window.location.href = '/signin';
  };
  const [sidebarIsOpen, setSidebarIsOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`/api/products/categories`);
        setCategories(data);
      } catch (err) {
        toast.error(getError(err));
      }
    };
    fetchCategories();
  }, []);
  return (
    <BrowserRouter>
      <div className="app-container">
        <div
          className={
            sidebarIsOpen
              ? fullBox
                ? 'site-container active-cont d-flex flex-column full-box'
                : 'site-container active-cont d-flex flex-column'
              : fullBox
              ? 'site-container d-flex flex-column full-box'
              : 'site-container d-flex flex-column'
          }
        >
          <ToastContainer position="bottom-center" limit={1} />
          <header>
            <Navbar
              variant="dark"
              expand="lg"
              style={{ backgroundColor: '#eeeeee' }}
            >
              <Container>
                <Button
                  className="btn-sidebar"
                  variant="#eeeeee"
                  onClick={() => setSidebarIsOpen(!sidebarIsOpen)}
                >
                  <i className="fas fa-bars"></i>
                </Button>

                <LinkContainer to="/">
                  <Navbar.Brand>
                    <img
                      src="images\leaf.png"
                      alt="Icon"
                      className="icon"
                      width="30"
                      height="30"
                    />
                    NaturShop
                  </Navbar.Brand>
                </LinkContainer>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                  <SearchBox />
                  <Nav className="me-auto  w-100  justify-content-end">
                    <Link
                      to="/cart"
                      className="nav-link"
                      style={{ marginRight: '30px' }}
                    >
                      <img
                        src="images\shopping.png"
                        alt="Icon"
                        className="icon"
                        width="22"
                        height="22"
                        marginRight="0px"
                      />
                      Cos de cumparaturi
                      {cart.cartItems.length > 0 && (
                        <Badge pill bg="danger">
                          {cart.cartItems.reduce((a, c) => a + c.quantity, 0)}
                        </Badge>
                      )}
                    </Link>
                    <Link to="/contact" className="nav-link">
                      <img
                        src="images\contact.png"
                        alt="Icon"
                        className="icon"
                        width="20"
                        height="20"
                      />
                      Contact
                    </Link>
                    {/* <Link to="/admin/chat" className="nav-link">
                      chat
                    </Link> */}
                    {userInfo ? (
                      <NavDropdown
                        title={userInfo.name}
                        id="basic-nav-dropdown"
                      >
                        <LinkContainer to="/profile">
                          <NavDropdown.Item>
                            <img
                              src="images\person.png"
                              alt="Icon"
                              className="icon"
                              width="20"
                              height="20"
                            />
                            Profil
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/orderhistory">
                          <NavDropdown.Item>
                            <img
                              src="images\history.png"
                              alt="Icon"
                              className="icon"
                              width="20"
                              height="20"
                            />
                            Istoric cumparaturi
                          </NavDropdown.Item>
                        </LinkContainer>
                        <NavDropdown.Divider />

                        <Link
                          className="dropdown-item"
                          to="#signout"
                          onClick={signoutHandler}
                        >
                          <img
                            src="images\logout.png"
                            alt="Icon"
                            className="icon"
                            width="20"
                            height="20"
                          />
                          Deconecteaza-te
                        </Link>
                      </NavDropdown>
                    ) : (
                      <Link className="nav-link" to="/signin">
                        Conecteaza-te
                      </Link>
                    )}
                    {userInfo && userInfo.isAdmin && (
                      <NavDropdown title="Admin" id="admin-nav-dropdown">
                        <LinkContainer to="/admin/dashboard">
                          <NavDropdown.Item>
                            <img
                              src="images\statistics.png"
                              alt="Icon"
                              className="icon"
                              width="20"
                              height="20"
                            />
                            Statistici
                          </NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/products">
                          <NavDropdown.Item>Produse</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/orders">
                          <NavDropdown.Item>Comenzi</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/users">
                          <NavDropdown.Item>Utilizatori</NavDropdown.Item>
                        </LinkContainer>
                        <LinkContainer to="/admin/chat">
                          <NavDropdown.Item>Chat</NavDropdown.Item>
                        </LinkContainer>
                      </NavDropdown>
                    )}
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          </header>
          <div
            className={
              sidebarIsOpen
                ? 'active-nav side-navbar d-flex justify-content-between flex-wrap flex-column'
                : 'side-navbar d-flex justify-content-between flex-wrap flex-column'
            }
          >
            <Nav className="flex-column text-white w-100 p-2">
              <Nav.Item>
                <strong>Categorii</strong>
              </Nav.Item>
              {categories.map((category) => (
                <Nav.Item key={category}>
                  <LinkContainer
                    to={{ pathname: '/search', search: `category=${category}` }}
                    onClick={() => setSidebarIsOpen(false)}
                  >
                    <Nav.Link>{category}</Nav.Link>
                  </LinkContainer>
                </Nav.Item>
              ))}
            </Nav>
          </div>
          <main>
            <Container className="mt-3">
              <Routes>
                <Route path="/product/:slug" element={<ProductScreen />} />
                <Route path="/cart" element={<CartScreen />} />
                <Route path="/search" element={<SearchScreen />} />
                <Route path="/signin" element={<SigninScreen />} />
                <Route path="/signup" element={<SignupScreen />} />
                <Route path="/contact" element={<ContactScreen />}></Route>
                <Route
                  path="/create-product"
                  element={<ProductCreateScreen />}
                />
                <Route
                  path="/forget-password"
                  element={<ForgetPasswordScreen />}
                />
                <Route
                  path="/reset-password/:token"
                  element={<ResetPasswordScreen />}
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <ProfileScreen />
                    </ProtectedRoute>
                  }
                />
                :{' '}
                <Route
                  path="/map"
                  element={
                    <ProtectedRoute>
                      <MapScreen />
                    </ProtectedRoute>
                  }
                />
                <Route path="/placeorder" element={<PlaceOrderScreen />} />
                <Route
                  path="/order/:id"
                  element={
                    <ProtectedRoute>
                      <OrderScreen />
                    </ProtectedRoute>
                  }
                ></Route>
                <Route
                  path="/orderhistory"
                  element={
                    <ProtectedRoute>
                      <OrderHistoryScreen />
                    </ProtectedRoute>
                  }
                ></Route>
                {/* <Route
                  path="/admin/chat"
                  element={
                    <ProtectedRoute>
                      <ChatScreen />
                    </ProtectedRoute>
                  }
                /> */}
                <Route
                  path="/shipping"
                  element={<ShippingAddressScreen />}
                ></Route>
                <Route
                  path="/payment"
                  element={<PaymentMethodScreen />}
                ></Route>
                {/* Admin Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <AdminRoute>
                      <DashboardScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/orders"
                  element={
                    <AdminRoute>
                      <OrderListScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/users"
                  element={
                    <AdminRoute>
                      <UserListScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/products"
                  element={
                    <AdminRoute>
                      <ProductListScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/chat"
                  element={
                    <AdminRoute>
                      <ChatScreen />
                    </AdminRoute>
                  }
                />
                <Route
                  path="/admin/product/:id"
                  element={
                    <AdminRoute>
                      <ProductEditScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route
                  path="/admin/user/:id"
                  element={
                    <AdminRoute>
                      <UserEditScreen />
                    </AdminRoute>
                  }
                ></Route>
                <Route path="/" element={<HomeScreen />} />
              </Routes>
            </Container>
          </main>
        </div>
        {userInfo && !userInfo.isAdmin && <ChatBox userInfo={userInfo} />}
        <div>All right reserved</div>{' '}
      </div>
    </BrowserRouter>
  );
}

export default App;
