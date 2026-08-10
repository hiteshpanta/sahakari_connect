// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { useAuth } from './AuthContext';

// const DataContext = createContext();

// export const useData = () => useContext(DataContext);

// export const DataProvider = ({ children }) => {
//   const { currentUser } = useAuth();
//   const [data, setData] = useState({
//     customers: [],
//     accounts: [],
//     transactions: [],
//     loans: [],
//     branches: [],
//     users: [],
//     dashboard: null,
//     loading: true
//   });

//   const fetchData = useCallback(async () => {
//     const token = localStorage.getItem('token');
//     if (!token) {
//       setData(prev => ({ ...prev, loading: false }));
//       return;
//     }

//     const headers = {
//       'Authorization': `Bearer ${token}`
//     };

//     try {
//       const [cust, acc, txn, loan, br, usr, dash] = await Promise.all([
//         fetch('/api/customers', { headers }).then(r => r.json()),
//         fetch('/api/accounts', { headers }).then(r => r.json()),
//         fetch('/api/transactions', { headers }).then(r => r.json()),
//         fetch('/api/loans', { headers }).then(r => r.json()),
//         fetch('/api/branches', { headers }).then(r => r.json()),
//         fetch('/api/users', { headers }).then(r => r.json()),
//         fetch('/api/dashboard', { headers }).then(r => r.json())
//       ]);
      
//       setData({
//         customers: cust.message ? [] : cust,
//         accounts: acc.message ? [] : acc,
//         transactions: txn.message ? [] : txn,
//         loans: loan.message ? [] : loan,
//         branches: br.message ? [] : br,
//         users: usr.message ? [] : usr,
//         dashboard: dash.message ? null : dash,
//         loading: false
//       });
//     } catch (e) {
//       console.error('Error fetching data:', e);
//       setData(prev => ({ ...prev, loading: false }));
//     }
//   }, []);

//   useEffect(() => {
//     if (currentUser) {
//       fetchData();
//     } else {
//       setData({
//         customers: [], accounts: [], transactions: [], loans: [], 
//         branches: [], users: [], dashboard: null, loading: false
//       });
//     }
//   }, [currentUser, fetchData]);

//   return (
//     <DataContext.Provider value={{ ...data, refetch: fetchData }}>
//       {children}
//     </DataContext.Provider>
//   );
// };
