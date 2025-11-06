import React from "react";
import { useNavigate } from "react-router-dom";

export default function UserLink({ userId, username, className, children, onClick }) {
  const navigate = useNavigate();
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) {
      console.warn("UserLink: No userId provided");
      return;
    }
    
    // If custom onClick is provided, call it
    if (onClick) {
      onClick(e);
      return;
    }
    
    console.log('🔵 UserLink - Navigating to profile:', userId);
    navigate(`/Profile?userId=${userId}`);
  };

  // Support both button and anchor tag rendering
  if (className?.includes('block') || className?.includes('flex')) {
    return (
      <div
        onClick={handleClick}
        className={`hover:opacity-80 transition-opacity cursor-pointer ${className || ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e);
          }
        }}
      >
        {children || username}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`hover:opacity-80 transition-opacity cursor-pointer inline-block ${className || ''}`}
      type="button"
    >
      {children || username}
    </button>
  );
}