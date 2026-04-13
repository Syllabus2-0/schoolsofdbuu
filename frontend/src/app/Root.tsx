import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

export default function Root() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
