import React, { useEffect } from "react";
import * as SecureStore from "expo-secure-store";
import { useDispatch } from "react-redux";
import { setToken } from "../store/authSlice";

export default function AuthLoader() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadToken = async () => {
      const token = await SecureStore.getItemAsync("userToken");
      if (token) {
        dispatch(setToken(token));
      }
    };
    loadToken();
  }, [dispatch]);

  return null; // or a loading spinner if you want
}
