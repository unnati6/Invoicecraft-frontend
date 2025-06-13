// utils/getCountries.js
import axios from 'axios';
export const getCountries = async () => {
  try {
    const res = await fetch(
      'https://restcountries.com/v3.1/all?fields=name,cca2'
    );
    if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

    const data = await res.json();

    const countries = data.map((country) => ({
      name: country.name.common,
      iso2: country.cca2,
    }));

    countries.sort((a, b) => a.name.localeCompare(b.name));

    return countries;
  } catch (error) {
    console.error('Failed to fetch countries', error);
    return [];
  }
};
