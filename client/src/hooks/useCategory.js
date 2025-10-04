import { useState, useEffect } from "react";
import axios from "axios";
import toast from 'react-hot-toast';

export default function useCategory() {
  const [categories, setCategories] = useState([]);

  //get cat
  // changed error handling to match other instances
  const getAllCategories = async () => {
    try {
      const { data } = await axios.get("/api/v1/category/get-category");
      if (data.success) {
        setCategories(data.category);
      } else {
        toast.error(data.message); 
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong in getting category");
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  return { categories, getAllCategories };
}