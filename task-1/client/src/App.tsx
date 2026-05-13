import { UsersProvider } from './state/UsersContext';
import UsersPage from './pages/UsersPage';
import './App.css';

function App() {
  return (
    <UsersProvider>
      <div className="App">
        <UsersPage />
      </div>
    </UsersProvider>
  );
}

export default App;
