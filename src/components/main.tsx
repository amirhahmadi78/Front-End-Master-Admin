import {  useNavigate } from "react-router-dom";
import './main.css'

const MainPage = () => {
  const navigate = useNavigate();
  return (
    <div className="firstPage">
  <a onClick={()=>navigate("/login")} className="Login-btn">برای ورود به حساب کاربری خود کلیک کنید</a>
    <br/>
        <br/>
    {/* <a onClick={()=>{navigate("/register")}} className="Signup-btn">برو ثبت نام</a> */}
    </div>
  
  )
}
export default MainPage