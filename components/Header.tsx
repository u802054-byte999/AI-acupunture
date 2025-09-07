
import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  actions?: ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton = false, actions }) => {
  const navigate = useNavigate();

  return (
    <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md flex items-center justify-between">
      <div className="flex items-center">
        {showBackButton && (
          <button onClick={() => navigate(-1)} className="mr-4 p-2 rounded-full hover:bg-blue-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-xl font-bold">{title}</h1>
      </div>
      <div>{actions}</div>
    </header>
  );
};

export default Header;
