import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { fetchProducts } from '../services/dataService';

export function useInitializeData() {
  const setProducts = useStore((state) => state.setProducts);

  useEffect(() => {
    const loadData = async () => {
      try {
        const products = await fetchProducts();
        setProducts(products);
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    loadData();
  }, [setProducts]);
}