import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../constants';

// Test loading (fetch + loading flag) for the Cambridge test interface.
// State names, effect body and deps extracted verbatim from
// pages/CambridgeTestInterface.js; the effect still runs on [bookId, testId].
export function useCambridgeTestData(bookId, testId) {
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTest();
  }, [bookId, testId]);

  const loadTest = async () => {
    try {
      const res = await fetch(`${API_URL}/api/cambridge/test/${bookId}/${testId}`);
      const data = await res.json();
      
      if (data.success) {
        setTestData(data.test);
      } else {
        toast.error('Failed to load test');
      }
    } catch (error) {
      console.error('Error loading test:', error);
      toast.error('Error loading test data');
    } finally {
      setLoading(false);
    }
  };

  return { testData, loading };
}
