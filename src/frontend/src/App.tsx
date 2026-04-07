import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Banner from './components/Banner';
import Navbar from './components/Navbar';
import RecipeDetail from './routes/RecipeDetail';
import Recipes from './routes/Recipes';
import Dashboard from './routes/Dashboard';
import Login from './routes/Login';

const App = () => {
  return (
    <Router>
      <Banner />
      <div className="p-4">
        <div className="mx-auto max-w-5xl">
          <Navbar />
          <Routes>
            <Route path="/" element={<Recipes />} />
            <Route path="/recipe/:id" element={<RecipeDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
