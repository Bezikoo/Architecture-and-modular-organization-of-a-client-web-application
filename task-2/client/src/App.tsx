import { Provider } from 'react-redux';
import { store } from './store';
import TicketsPage from './pages/TicketsPage';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <TicketsPage />
      </div>
    </Provider>
  );
}

export default App;
