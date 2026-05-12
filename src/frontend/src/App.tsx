import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AdminPanel from './routes/AdminPanel';
import AuthProvider from './utils/AuthProvider';
import Banner from './components/Banner';
import Footer from './components/Footer';
import Friends from './routes/Friends';
import Navbar from './components/Navbar';
import Dashboard from './routes/Dashboard';
import Login from './routes/Login';
import PrivacyPolicy from './routes/PrivacyPolicy';
import NotificationProvider from './utils/NotifProvider';
import RecipeDetail from './routes/RecipeDetail';
import Recipes from './routes/Recipes';
import Signup from './routes/Signup';
import TermsService from './routes/TermsService';

const App = () => {
  const { t } = useTranslation();

  return (
    <AuthProvider t={t}>
      <NotificationProvider>
        <Router>
          <div className="flex min-h-screen flex-col">
            <Banner />
            <div className="flex-1 p-4">
              <div className="mx-auto max-w-7xl">
                <Navbar />
                <Routes>
                  <Route path="/" element={<Recipes />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/recipes/:id" element={<RecipeDetail />} />
                  <Route path="/me" element={<Dashboard />} />
                  <Route path="/users/:id" element={<Dashboard />} />
                  <Route path="/friends" element={<Friends />} />
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
    </AuthProvider>
  );
};

export default App;
