import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const base = 'https://sahakari-connect.onrender.com/api';

export const baseUrl = 'https://sahakari-connect.onrender.com/api';

// export const base = 'http://localhost:5000/api';

// export const baseUrl = 'http://localhost:5000/api';



export const mainApi = createApi({
  reducerPath: 'mainApi',

  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: 'include',
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    }
  }),

  tagTypes: [
    'Auth',
    'customers',
    'Accounts',
    'Transactions',
    'Withdrawals',
    'Loans',
    'Member',
    'Branches',
    'Users',
    'Cooperatives',
    'Kyc',
    'Sms',
    'Dashboard',
    'Payments'
  ],

  endpoints: (builder) => ({
    // ---------- Auth ----------
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      invalidatesTags: ['Auth']
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      invalidatesTags: ['Auth']
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['Auth']
    }),
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['Auth']
    }),

    // ---------- Customers ----------
    getCustomers: builder.query({
      query: () => '/customers',
      providesTags: ['customers']
    }),
    applyForMembership: builder.mutation({
      query: (body) => ({ url: '/customers/apply', method: 'POST', body }),
      invalidatesTags: ['customers']
    }),
    updateCustomerStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/customers/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['customers']
    }),

    // ---------- Accounts ----------
    getAccounts: builder.query({
      query: () => '/accounts',
      providesTags: ['Accounts']
    }),
    getAccountById: builder.query({
      query: (id) => `/accounts/${id}`,
      providesTags: ['Accounts']
    }),
    createAccount: builder.mutation({
      query: (body) => ({ url: '/accounts', method: 'POST', body }),
      invalidatesTags: ['Accounts']
    }),

    // ---------- Transactions ----------
    getTransactions: builder.query({
      query: () => '/transactions',
      providesTags: ['Transactions']
    }),
    getTransactionById: builder.query({
      query: (id) => `/transactions/${id}`,
      providesTags: ['Transactions']
    }),
    createTransaction: builder.mutation({
      query: (body) => ({ url: '/transactions', method: 'POST', body }),
      invalidatesTags: ['Transactions', 'Accounts']
    }),

    // ---------- Withdrawals ----------
    getWithdrawals: builder.query({
      query: () => '/withdrawals',
      providesTags: ['Withdrawals']
    }),
    createWithdrawal: builder.mutation({
      query: (body) => ({ url: '/withdrawals', method: 'POST', body }),
      invalidatesTags: ['Withdrawals']
    }),
    approveWithdrawal: builder.mutation({
      query: (id) => ({ url: `/withdrawals/${id}/approve`, method: 'PUT' }),
      invalidatesTags: ['Withdrawals', 'Accounts']
    }),
    rejectWithdrawal: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/withdrawals/${id}/reject`, method: 'PUT', body }),
      invalidatesTags: ['Withdrawals']
    }),

    // ---------- Loans ----------
    getLoans: builder.query({
      query: () => '/loans',
      providesTags: ['Loans']
    }),
    getLoanById: builder.query({
      query: (id) => `/loans/${id}`,
      providesTags: ['Loans']
    }),
    createLoan: builder.mutation({
      query: (body) => ({ url: '/loans', method: 'POST', body }),
      invalidatesTags: ['Loans']
    }),
    applyForLoan: builder.mutation({
      query: (body) => ({ url: '/loans/apply', method: 'POST', body }),
      invalidatesTags: ['Loans']
    }),
    predictLoan: builder.mutation({
      query: (body) => ({ url: '/loans/predict', method: 'POST', body })
    }),
    updateLoanStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/loans/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['Loans']
    }),
    approveLoan: builder.mutation({
      query: (id) => ({ url: `/loans/${id}/approve`, method: 'PUT' }),
      invalidatesTags: ['Loans']
    }),

    // ---------- Member ----------
    getMemberDashboard: builder.query({
      query: (cooperativeId) =>
        cooperativeId
          ? `/member/dashboard?cooperativeId=${encodeURIComponent(cooperativeId)}`
          : '/member/dashboard',
      providesTags: ['Member']
    }),
    getMemberAccounts: builder.query({
      query: (cooperativeId) =>
        cooperativeId
          ? `/member/accounts?cooperativeId=${encodeURIComponent(cooperativeId)}`
          : '/member/accounts',
      providesTags: ['Member']
    }),
    getMemberTransactions: builder.query({
      query: (params) => {
        const qs = new URLSearchParams();
        if (params?.cooperativeId) qs.set('cooperativeId', params.cooperativeId);
        if (params?.type) qs.set('type', params.type);
        if (params?.startDate) qs.set('startDate', params.startDate);
        if (params?.endDate) qs.set('endDate', params.endDate);
        const s = qs.toString();
        return s ? `/member/transactions?${s}` : '/member/transactions';
      },
      providesTags: ['Member', 'Transactions']
    }),
    getMemberLoans: builder.query({
      query: (cooperativeId) =>
        cooperativeId
          ? `/member/loans?cooperativeId=${encodeURIComponent(cooperativeId)}`
          : '/member/loans',
      providesTags: ['Member']
    }),
    getMemberCooperatives: builder.query({
      query: () => '/member/cooperatives',
      providesTags: ['Member']
    }),
    getMemberProfile: builder.query({
      query: (cooperativeId) =>
        cooperativeId
          ? `/member/profile?cooperativeId=${encodeURIComponent(cooperativeId)}`
          : '/member/profile',
      providesTags: ['Member']
    }),
    updateMemberProfile: builder.mutation({
      query: (body) => ({ url: '/member/profile', method: 'PUT', body }),
      invalidatesTags: ['Member', 'Auth']
    }),

    // ---------- Branches ----------
    getBranches: builder.query({
      query: () => '/branches',
      providesTags: ['Branches']
    }),
    createBranch: builder.mutation({
      query: (body) => ({ url: '/branches', method: 'POST', body }),
      invalidatesTags: ['Branches']
    }),

    // ---------- Users ----------
    getUsers: builder.query({
      query: () => '/users',
      providesTags: ['Users']
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['Users']
    }),
    deleteUser: builder.mutation({
      query: (id) => ({ url: `/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Users']
    }),

    // ---------- Cooperatives ----------
    getPublicCooperatives: builder.query({
      query: () => '/cooperatives/public',
      providesTags: ['Cooperatives']
    }),
    getPublicCooperative: builder.query({
      query: (id) => `/cooperatives/public/${id}`,
      providesTags: ['Cooperatives']
    }),
    getCooperativeReviews: builder.query({
      query: (id) => `/cooperatives/public/${id}/reviews`,
      providesTags: ['Cooperatives']
    }),
    getCooperativeProfile: builder.query({
      query: () => '/cooperatives/me',
      providesTags: ['Cooperatives']
    }),
    updateCooperativeProfile: builder.mutation({
      query: (body) => ({ url: '/cooperatives/me', method: 'PUT', body }),
      invalidatesTags: ['Cooperatives', 'Auth']
    }),
    getAdminAnalytics: builder.query({
      query: () => '/cooperatives/analytics',
      providesTags: ['Cooperatives']
    }),
    getCooperatives: builder.query({
      query: () => '/cooperatives',
      providesTags: ['Cooperatives']
    }),
    getCooperativeById: builder.query({
      query: (id) => `/cooperatives/${id}`,
      providesTags: ['Cooperatives']
    }),
    createCooperative: builder.mutation({
      query: (body) => ({ url: '/cooperatives', method: 'POST', body }),
      invalidatesTags: ['Cooperatives']
    }),
    updateCooperative: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cooperatives/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Cooperatives']
    }),
    deleteCooperative: builder.mutation({
      query: (id) => ({ url: `/cooperatives/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Cooperatives']
    }),
    updateCooperativeStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cooperatives/${id}/status`, method: 'PUT', body }),
      invalidatesTags: ['Cooperatives']
    }),

    // ---------- Cooperative KYC ----------
    applyForCooperative: builder.mutation({
      query: (body) => ({ url: '/cooperative-kyc/apply', method: 'POST', body }),
      invalidatesTags: ['Kyc', 'Cooperatives']
    }),
    getMyKyc: builder.query({
      query: () => '/cooperative-kyc/my',
      providesTags: ['Kyc']
    }),
    getKycRequests: builder.query({
      query: (cooperativeId) => `/cooperative-kyc/${cooperativeId}`,
      providesTags: ['Kyc']
    }),
    approveKyc: builder.mutation({
      query: (id) => ({ url: `/cooperative-kyc/approve/${id}`, method: 'PATCH' }),
      invalidatesTags: ['Kyc', 'Cooperatives', 'Member']
    }),
    rejectKyc: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cooperative-kyc/reject/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Kyc']
    }),
    insufficientKyc: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/cooperative-kyc/insufficient/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Kyc']
    }),

    // ---------- Dashboard ----------
    getDashboardStats: builder.query({
      query: (cooperativeId) =>
        cooperativeId
          ? `/dashboard?cooperativeId=${encodeURIComponent(cooperativeId)}`
          : '/dashboard',
      providesTags: ['Dashboard']
    }),

    // ---------- Payments ----------
    createPaymentIntent: builder.mutation({
      query: (body) => ({ url: '/payments/intent', method: 'POST', body })
    }),
    completeEsewaPayment: builder.mutation({
      query: (body) => ({ url: '/payments/esewa/complete', method: 'POST', body })
    }),
    getPaymentHistory: builder.query({
      query: () => '/payments/history',
      providesTags: ['Payments']
    }),

    // ---------- SMS ----------
    sendSms: builder.mutation({
      query: (body) => ({ url: '/sms/send', method: 'POST', body }),
      invalidatesTags: ['Sms']
    }),
    getSmsLogs: builder.query({
      query: () => '/sms/logs',
      providesTags: ['Sms']
    }),

    // ---------- Tenant branding ----------
    getTenant: builder.query({
      query: (domain) => `/public/tenant?domain=${domain}`
    })
  })
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
  useGetCustomersQuery,
  useApplyForMembershipMutation,
  useUpdateCustomerStatusMutation,
  useGetAccountsQuery,
  useGetAccountByIdQuery,
  useCreateAccountMutation,
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useGetWithdrawalsQuery,
  useCreateWithdrawalMutation,
  useApproveWithdrawalMutation,
  useRejectWithdrawalMutation,
  useGetLoansQuery,
  useGetLoanByIdQuery,
  useCreateLoanMutation,
  useApplyForLoanMutation,
  usePredictLoanMutation,
  useUpdateLoanStatusMutation,
  useApproveLoanMutation,
  useGetMemberDashboardQuery,
  useGetMemberAccountsQuery,
  useGetMemberTransactionsQuery,
  useGetMemberLoansQuery,
  useGetMemberCooperativesQuery,
  useGetMemberProfileQuery,
  useUpdateMemberProfileMutation,
  useGetBranchesQuery,
  useCreateBranchMutation,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetPublicCooperativesQuery,
  useGetPublicCooperativeQuery,
  useGetCooperativeReviewsQuery,
  useGetCooperativeProfileQuery,
  useUpdateCooperativeProfileMutation,
  useGetAdminAnalyticsQuery,
  useGetCooperativesQuery,
  useGetCooperativeByIdQuery,
  useCreateCooperativeMutation,
  useUpdateCooperativeMutation,
  useDeleteCooperativeMutation,
  useUpdateCooperativeStatusMutation,
  useApplyForCooperativeMutation,
  useGetMyKycQuery,
  useGetKycRequestsQuery,
  useApproveKycMutation,
  useRejectKycMutation,
  useInsufficientKycMutation,
  useGetDashboardStatsQuery,
  useCreatePaymentIntentMutation,
  useCompleteEsewaPaymentMutation,
  useGetPaymentHistoryQuery,
  useSendSmsMutation,
  useGetSmsLogsQuery,
  useGetTenantQuery,
} = mainApi;
