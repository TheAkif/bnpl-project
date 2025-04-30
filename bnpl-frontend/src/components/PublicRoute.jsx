import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const token = localStorage.getItem('bnpl_access');
  if (token) {
    const user = JSON.parse(localStorage.getItem('bnpl_user') || '{}');
    return (
      <Navigate
        to={user.role === 'merchant' ? '/merchant' : '/user'}
        replace
      />
    );
  }
  return children;
}
