import React, {
  useEffect,
  useRef,
  useState,
  useReducer,
  useContext,
} from 'react';
import socketIOClient from 'socket.io-client';
import { useSelector } from 'react-redux';
import MessageBox from '../components/MessageBox';
import { Store } from '../Store';
import axios from 'axios';
import { getError } from '../utils';

let allUsers = [];
let allSelectedUser = {};
const ENDPOINT =
  window.location.host.indexOf('localhost') >= 0
    ? 'http://127.0.0.1:4000'
    : window.location.host;

const reducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_REQUEST':
      return { ...state, loading: true };
    case 'CREATE_SUCCESS':
      return { ...state, loading: false };
    case 'CREATE_FAIL':
      return { ...state, loading: false };
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, messages: action.payload, loading: false };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function ChatScreen() {
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const uiMessagesRef = useRef(null);
  const [messageBody, setMessageBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const userSignin = useSelector((state) => state.userInfo);
  const userInfo = userSignin;
  const [{ loading }, dispatch] = useReducer(reducer, {
    loading: false,
  });
  const allMessagesRef = useRef([]);

  const { state, dispatch: ctxDispatch } = useContext(Store);

  const fetchMessages = async () => {
    dispatch({ type: 'FETCH_REQUEST' });
    try {
      const queryParams = {
        selectedUserID: selectedUser._id,
      };

      const response = await axios.get('/api/messages', {
        headers: {
          authorization: `Bearer ${userInfo.token}`,
        },
        params: queryParams,
      });

      const filteredMessages = response.data.filter((msg) => {
        if (msg.isAdmin) {
          return msg.selectedUserID === selectedUser._id;
        } else {
          return msg.userID === selectedUser._id;
        }
      });

      setMessages(filteredMessages);
      dispatch({ type: 'FETCH_SUCCESS' });
      allMessagesRef.current = filteredMessages;
    } catch (error) {
      dispatch({ type: 'FETCH_FAIL', payload: getError(error) });
    }
  };

  useEffect(() => {
    fetchMessages();
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        bottom: uiMessagesRef.current.clientHeight,
        left: 0,
        behavior: 'smooth',
      });
    }
    if (userInfo != null) {
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
            // allMessages = [...allMessages, data];
            allMessagesRef.current = [...allMessagesRef.current, data];
            setMessages(allMessagesRef.current); // Actualizează ref-ul cu mesajele primite
          } else {
            const existUser = allUsers.find((user) => user._id === data._id);
            if (existUser) {
              allUsers = allUsers.map((user) =>
                user._id === existUser._id ? { ...user, unread: true } : user
              );
              setUsers(allUsers);
            }
          }
          // setMessages(allMessages);
        });
        sk.on('updateUser', (updatedUser) => {
          const existUser = allUsers.find(
            (user) => user._id === updatedUser._id
          );
          if (existUser) {
            allUsers = allUsers.map((user) =>
              user._id === existUser._id ? updatedUser : user
            );
            setUsers(allUsers);
          } else {
            allUsers = [...allUsers, updatedUser];
            setUsers(allUsers);
          }
        });
        sk.on('listUsers', (updatedUsers) => {
          allUsers = updatedUsers;
          setUsers(allUsers);
        });
        sk.on('selectUser', (user) => {
          // allMessages = user.messages;
          // setMessages(allMessages);
          allMessagesRef.current = user.messages; // Actualizează ref-ul cu mesajele utilizatorului selectat
          setMessages(allMessagesRef.current);
        });
      }
    }
  }, [socket, users, selectedUser._id]);

  const selectUser = async (user) => {
    allSelectedUser = user;
    setSelectedUser(allSelectedUser);
    const existUser = allUsers.find((x) => x._id === user._id);
    if (existUser) {
      allUsers = allUsers.map((x) =>
        x._id === existUser._id ? { ...x, unread: false } : x
      );
      setUsers(allUsers);
    }
    socket.emit('onUserSelected', user);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert('Scrie un mesaj.');
    } else if (!selectedUser.online) {
      alert(
        'Utilizatorul nu este online. Nu se pot trimite mesaje catre acesta.'
      );
    } else {
      // allMessages = [
      //   ...allMessages,
      //   { body: messageBody, name: userInfo.name },
      // ];
      allMessagesRef.current = [
        ...allMessagesRef.current,
        { body: messageBody, name: userInfo.name },
      ]; // Actualizează ref-ul cu noul mesaj

      try {
        dispatch({ type: 'CREATE_REQUEST' });
        const { data } = await axios.post(
          '/api/messages',
          {
            body: messageBody,
            name: userInfo.name,
            isAdmin: userInfo.isAdmin,
            userID: userInfo._id,
            selectedUserID: selectedUser._id,
          },
          {
            headers: {
              authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        console.log('Mesajul a fost trimis cu succes:', data);
        dispatch({ type: 'CREATE_SUCCESS' });
      } catch (error) {
        console.error('Eroare la trimiterea mesajului:', error);
        dispatch({ type: 'CREATE_FAIL' });
      }
      setMessages(allMessagesRef.current);
      setMessageBody('');
      setTimeout(() => {
        socket.emit('onMessage', {
          body: messageBody,
          name: userInfo.name,
          isAdmin: userInfo.isAdmin,
          _id: selectedUser._id,
        });
      }, 1000);
    }
    fetchMessages();
  };

  return (
    <div className="row top full-container">
      <div className="col-1 support-users">
        {users.filter((x) => x._id !== userInfo._id).length === 0 && (
          <MessageBox>Nu sunt utilizatori conectati</MessageBox>
        )}

        <ul>
          {users
            .filter((x) => x._id !== userInfo._id)
            .map((user) => (
              <li
                key={user._id}
                className={user._id === selectedUser._id ? 'selected' : ''}
              >
                <button
                  className="block"
                  type="button"
                  onClick={() => selectUser(user)}
                >
                  {user.name}
                </button>
                <span
                  className={
                    user.unread ? 'unread' : user.online ? 'online' : 'offline'
                  }
                />
              </li>
            ))}
        </ul>
      </div>
      <div className="col-3 support-messages">
        {!selectedUser._id ? (
          <MessageBox className="wider">
            Selecteaza un utilizator pentru a incepe conversatia
          </MessageBox>
        ) : (
          <div>
            <div className="row">
              <strong>Conversație cu {selectedUser.name}</strong>
              <small>(Mesajele dispar automat după 12 ore)</small>
            </div>

            <ul ref={uiMessagesRef}>
              {messages.length === 0 && <li>Fara mesaje.</li>}
              {messages.map((msg, index) => (
                <li key={index}>
                  <strong>{`${msg.name}: `}</strong> {msg.body}
                </li>
              ))}
            </ul>
            <div>
              <form onSubmit={submitHandler} className="row">
                <input
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type="text"
                  placeholder="Scrie mesajul aici..."
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                  }}
                />
                <button
                  type="submit"
                  onClick={submitHandler}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Trimite
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
