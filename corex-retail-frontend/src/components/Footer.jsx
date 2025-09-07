import React, { useState, useEffect } from 'react';

function Footer() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchLastUpdated = async () => {
      try {
        const response = await fetch('/LAST_UPDATED.txt');
        const text = await response.text();
        setLastUpdated(text.replace('Last Updated: ', '').trim());
      } catch (error) {
        console.error('Error reading update timestamp:', error);
        setLastUpdated('Unknown');
      }
    };

    fetchLastUpdated();
  }, []);

  return (
    <footer className="text-xs text-gray-500 text-center p-2">
      Last Updated: {lastUpdated} by <b>Karan F. Modi</b>
    </footer>
  );
}

export default Footer;