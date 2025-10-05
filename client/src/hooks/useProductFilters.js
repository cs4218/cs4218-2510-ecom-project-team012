import { useState } from 'react';
import axios from 'axios';

export const useProductFilters = (setProducts) => {
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) {
      all.push(id);
    } else {
      all = all.filter((c) => c !== id);
    }
    setChecked(all);
  };

  const filterProducts = async () => {
    try {
      const { data } = await axios.post("/api/v1/product/product-filters", {
        checked,
        radio,
      });
      setProducts(data?.products || []);
    } catch (error) {
      console.log(error);
    }
  };

  return {
    checked,
    radio,
    setRadio,
    handleFilter,
    filterProducts
  };
};