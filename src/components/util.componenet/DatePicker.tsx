import DatePicker from "react-multi-date-picker";

import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

import moment from "moment-jalaali";
import { useState } from "react";

export default function DatePick({varDate,setvarDate}){

const [persianDate,setPersianDate]=useState(moment(new Date).format("jYYYY-jMM-jDD"))
const handleChangeDate=(date)=>{
 const Year=date.year
const Month=date.month.number<10?"0"+date.month.number:date.month.number
const Day=date.day<10?"0"+date.day:date.day
 const jDate=Year+"-"+Month+"-"+Day
 setPersianDate(jDate)
 const trueDate=moment(jDate,"jYYYY-jMM-jDD").format("YYYY-MM-DD")
 setvarDate(trueDate)
}
return(
    <>
     <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <label>📅 تاریخ :</label>
      <DatePicker
        value={persianDate}
        onChange={(date) => handleChangeDate(date)}
        
        format="YYYY/MM/DD"
        className="border rounded-md p-2"
         calendarPosition="bottom-right"
                   calendar={persian}
              locale={persian_fa}
               style={{
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "6px 10px",
              }}
      />
   
    </div>
    </>

)
}