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
    <footer>
      Last Updated: {lastUpdated}
    </footer>
  );
}

export default Footer;