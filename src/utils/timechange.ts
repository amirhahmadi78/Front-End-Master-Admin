
import gregorian from "react-date-object/calendars/gregorian";
import moment from "moment-jalaali";
  
  
  export function JYYYYMMDDToYYYYMMDD(d){
    let JDATE
 return (JDATE=d.convert(gregorian)
  .format("YYYY-MM-DD")
  .replace(/[۰-۹]/g, (digit) => "۰۱۲۳۴۵۶۷۸۹".indexOf(digit))) 


  }



export function IsoTOJYJMJD(d) {

  return moment(d).locale("fa").format("jYYYY-jMM-jDD");
}


export function IsoToTime(d) {

  return moment(d).locale("fa").format("HH:mm");
}

export function ObjDateToIso(object){
 return new Date(object)
}

export function IsoTOYYMMDD(d) {

  return moment(d).format("YYYY-MM-DD");
}

  
 
  // تابع تبدیل تاریخ از DatePicker به فرمت ISO
 export const convertDateToISO = (date) => {
    if (!date) return null;
    // اگر date یک DateObject است
    if (date && date.year && date.month && date.day) {
      // تبدیل تاریخ شمسی به میلادی
      const persianDate = date.year+"/"+ ((date.monthIndex + 1)<10?"0"+(date.monthIndex + 1):(date.monthIndex + 1))+"/"+ ((date.day)<10 ?("0"+(date.day)):(date.day))
      const gregorianDate = moment(persianDate,"jYYYY/jMM/jDD").toDate()
      return gregorianDate
    }
    return new Date(date)
  };



  // تابع تبدیل تاریخ ISO به DateObject برای DatePicker
  export const convertISOToDateObject = (isoDate) => {
    if (!isoDate) return  {
        year: 0,
        month: 0,
        day: 0,
      };
      const date = new Date(isoDate);
      // تبدیل به تاریخ شمسی
      const persianDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      return {
        year: persianDate.getFullYear(),
        month: persianDate.getMonth() + 1,
        day: persianDate.getDate()
      };
   
 
 
    }
  
