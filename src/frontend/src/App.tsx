import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Banner from './components/Banner';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import CreateRecipe from './routes/CreateRecipe';
import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import PrivacyPolicy from './routes/PrivacyPolicy';
import NotificationProvider from './utils/NotifProvider';
import RecipeDetail from './routes/RecipeDetail';
import Recipes from './routes/Recipes';
import Signup from './routes/Signup';
import TermsService from './routes/TermsService';

const App = () => {
  return (
    <NotificationProvider>
      <Router>
        <div className="flex min-h-screen flex-col">
          <Banner />
          <div className="flex-1 p-4">
            <div className="mx-auto max-w-7xl">
              <Navbar />
              <Routes>
                <Route path="/" element={<Recipes />} />
                <Route path="/recipes/:id" element={<RecipeDetail />} />
                <Route path="/create" element={<CreateRecipe />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsService />} />
              </Routes>
            </div>
          </div>
          <Footer className="mt-20" />
        </div>
      </Router>
    </NotificationProvider>
  );
};

export default App;
