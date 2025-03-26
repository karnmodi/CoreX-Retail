// Popup.jsx
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

const Popup = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = '400px',
  closeOnOutsideClick = true,
  showCloseButton = true,
  position = 'center'
}) => {
  const popupRef = useRef(null);

  // Handle ESC key press to close popup
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  // Handle click outside popup to close
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (closeOnOutsideClick && popupRef.current && !popupRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    
    // Lock body scroll when popup is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose, closeOnOutsideClick]);

  if (!isOpen) return null;

  // Determine popup position class
  let positionClass = 'items-center justify-center';
  if (position === 'top') positionClass = 'items-start pt-10 justify-center';
  if (position === 'bottom') positionClass = 'items-end pb-10 justify-center';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex overflow-auto animate-fadeIn">
      <div 
        className={`${positionClass} w-full h-full`} 
        onClick={closeOnOutsideClick ? onClose : undefined}
      >
        <div 
          className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col animate-scaleIn m-4"
          style={{ maxWidth: width, maxHeight: '90vh', width: '100%' }}
          ref={popupRef}
          onClick={(e) => e.stopPropagation()}
        >
          {(title || showCloseButton) && (
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
              {showCloseButton && (
                <button 
                  className="text-gray-400 hover:bg-gray-100 hover:text-gray-600 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                  onClick={onClose}
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
          <div className="p-5 overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

Popup.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  width: PropTypes.string,
  closeOnOutsideClick: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  position: PropTypes.oneOf(['center', 'top', 'bottom'])
};

export default Popup;

/* Example usage in your app:

import { useState } from 'react';
import Popup from './components/Popup';

function App() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  return (
    <div>
      <button 
        onClick={() => setIsPopupOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-md"
      >
        Open Popup
      </button>
      
      <Popup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)}
        title="Example Popup"
        width="500px"
      >
        <p className="mb-4">This is the content of the popup!</p>
        <button 
          onClick={() => setIsPopupOpen(false)}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Close
        </button>
      </Popup>
    </div>
  );
}
*/