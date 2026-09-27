import type { DayOfWeek, PaymentType, PaymentTypePatient } from "./enums";
import type { DayOfWeekType } from "./therapists";

type workDaySchema = {
 day: DayOfWeek
  startTime: Date,
  endTime: Date,

}

export interface DTOFindPatient {
      username?: string,
        phone?: string,
    page?:number,
    limit?:number,
      
        firstName?: string,
        lastName?: string,
        birthdayGT?:string
        birthdayLT?:string
        days?: DayOfWeekType[],
        role?: string,
        gender?:  string[],
    therapistIds?:string,
        therapists?: string[],
    parentName?:string
    parentPhone?:string
        isActive?:boolean,
}

export interface DTOmakePatient{
    firstName: string
    lastName: string
     phone: string
     
    paymentType: PaymentTypePatient
    bimehKind?:string
    discountPercent: number
    address:string
    introducedBy:string
  
    workDays: [workDaySchema]
            
}

export interface DTOeditPatient{
    _id:string
    firstName: string
    lastName: string
     phone: string
     
    paymentType: PaymentTypePatient
    bimehKind?:string
    discountPercent: number
    address:string
    introducedBy:string
  
    workDays: [workDaySchema]
            
}