import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Banner from './components/Banner';
import Footer from './components/Footer';
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
      <div className="flex min-h-screen flex-col">
        <Banner />

        <div className="flex-1 p-4">
          <div className="mx-auto max-w-7xl">
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

        <Footer className="mt-20" />
      </div>
    </Router>
  );
};

export default App;
