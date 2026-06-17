import { useEffect } from 'react';
import { saveToken, saveUser, authAPI } from '../services/api';

export default function GoogleCallback({ query = {} }) {
  useEffect(() => {
    if (query.token) {
      saveToken(query.token);
      authAPI.me()
        .then(res => {
          if (res.success) saveUser(res.user);
          else saveUser({ name: query.name, email: query.email });
        })
        .catch(() => saveUser({ name: query.name, email: query.email }))
        .finally(() => { window.location.hash = '#timeline'; });
    } else {
      window.location.hash = '#login';
    }
  }, [query.token, query.name, query.email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin h-8 w-8 border-4 border-[#2777df] border-t-transparent rounded-full" />
    </div>
  );
}
