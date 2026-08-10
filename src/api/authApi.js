import { mainApi } from "../store/mainApi";



const authApi = mainApi.injectEndpoints({

    endpoints: (builder) => ({
        
        userLogin: builder.mutation({
            query: (body) => ({
                url: '/auth/login',
                method: 'POST',
                body: body,

            }),
            invalidatesTags: ['Auth']

        }),

        userRegister: builder.mutation({
            query: (body) => ({
                url: '/auth/register',
                method: 'POST',
                body: body,

            })
        }),

        
    })
});

export const { useUserLoginMutation, useUserRegisterMutation } = authApi;