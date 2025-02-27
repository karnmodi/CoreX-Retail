import { useState, useEffect } from "react";

const useFetchCounties = () => {
  const [stateOptions, setStateOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCounties = async () => {
      try {
        const response = await fetch("https://towns.online-tech.co.uk/api/v1/towns");
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const result = await response.json();
        const uniqueCounties = [...new Set(result.data.map((town) => town.county_unitary))]
          .filter(Boolean) // Remove null values
          .sort()
          .map((county) => ({
            value: county.toLowerCase().replace(/\s+/g, "-"), // Format value
            label: county, // Display name
          }));

        setStateOptions(uniqueCounties);
      } catch (err) {
        setError(`Failed to fetch counties: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCounties();
  }, []);

  return { stateOptions, loading, error };
};

export default useFetchCounties;
