import logo from './logo.svg';
import './App.css'; import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import RedirectPage from './components/pages/redirectPage';
import HomePage from './components/pages/homePage';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React from 'react';
import RegisterPage from './components/pages/registerPage';

function App() {
  const [loading, setLoading] = React.useState(false);
  const GOOGLE_CLIENT_ID = '214238479226-oss7l4kjcn86esb68b64qp9fonju82sq.apps.googleusercontent.com';
  return (
    <div>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}
        onScriptLoadSuccess={() => setLoading(true)}>
        <BrowserRouter>
          <Routes>
            <Route exact path="/" element={<RedirectPage loading={loading} />} />
            <Route exact path="/authPage" element={<RegisterPage />} />
            <Route exact path="/homePage" element={<HomePage />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
