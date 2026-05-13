import { Provider } from 'react-redux';
import { store } from './store';
import UsersPage from './pages/UsersPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <UsersPage />
      </div>
    </Provider>
  );
}

export default App;
