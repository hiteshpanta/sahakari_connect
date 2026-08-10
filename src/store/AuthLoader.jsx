
import {useDispatch, useSelector} from "react-redux";
import { useMeQuery } from "./mainApi";
import { useEffect } from "react";
import { setUser } from "./authSlice";



export default function AuthLoader({children}){


    const dispatch=useDispatch();
    const {loading} = useSelector(
        state => state.auth
    );

    const { data, isError } = useMeQuery();

    useEffect(() => {
        if (isError) {
            dispatch(setUser(null));
            return;
        }
        if (data) {
            dispatch(setUser(data?.user ?? data));
        }
    }, [data, isError, dispatch]);

    if (loading) {
        return <div>Checking authentication...</div>
    }



    return children;

}
