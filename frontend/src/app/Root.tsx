import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';

export default function Root() {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
  }, [currentUser, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
