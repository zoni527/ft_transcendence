import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Banner from './components/Banner';
import Navbar from './components/Navbar';
import CreateRecipe from './routes/CreateRecipe';
import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import RecipeDetail from './routes/RecipeDetail';
import Recipes from './routes/Recipes';
import Signup from './routes/Signup';

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
            <Route path="/create" element={<CreateRecipe />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
