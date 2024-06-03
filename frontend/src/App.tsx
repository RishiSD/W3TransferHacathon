//App.js
import { Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Download from './components/Download';

function App() {
  return (
    <div className="App">
      <h2 className="text-5xl font-serif font-bold italic text-gray-900 text-center mb-6 pt-6">
        W3Transfer
      </h2>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/download" element={<Download />} />
      </Routes>
    </div>
  );
}

export default App;
