import {  useEffect } from "react";
// import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import {useForm} from "react-hook-form"
import { loginSchema } from "../../validation/auth/loginSchema";
import type { LoginRequestDto } from "../../types/auth";

import "./login.css"
import { useAuth } from "../../context/AuthContext";
const LoginPage =  () => {

  // const { user,isAuthenticated,isLoading } = useAuth();
  const {login}=useAuth()
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });


  useEffect(() => {
    const msg = localStorage.getItem("auth_message");
    if (msg) {
      alert(msg);
      localStorage.removeItem("auth_message");
    }
  }, []);

  const onSubmit = async (data:LoginRequestDto) => {
    try {
   const res=await login(data)

   
      navigate('/dashboard')

    } catch (error) {
      alert("ورود ناموفق بود. لطفاً اطلاعات را بررسی کنید.");

    }
  };
  return (
    <div className="login-card">
<h1>صفحه ی ورود سوپر ادمین</h1>
<br />
<br />

      <h2>ورود</h2>
     

      <form onSubmit={handleSubmit(onSubmit)}>
        <input placeholder="نام کاربری" 
         {...register("phone")}/>
          {errors.phone && (
          <p className="error-message">{errors.phone.message}</p>
        )}
       

        <input
          type="password"
          placeholder="رمز عبور"
          {...register("password")}
        />
        {errors.password && (
          <p className="error-message">{errors.password.message}</p>
        )}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "در حال ورود..." : "ورود"}
        </button>
        <button type="button" onClick={() => navigate(-1)}>
          بازگشت
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
