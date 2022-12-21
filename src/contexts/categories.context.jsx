import { createContext, useState, useEffect } from "react";

import { getCategoriesAnsDocuments } from "../utils/firebase/firebase.utils";

export const CategoriesContext = createContext({
  products: [],
});

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const getCategories = async () => {
      const categoryMap = await getCategoriesAnsDocuments();
      setCategories(categoryMap);
    };

    getCategories();
  }, []);

  const value = { categories };
  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};
