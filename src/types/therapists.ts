export const DayOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
   'Saturday',
] as const;

export type daySchema={
    day:typeof DayOfWeek
}

export type DayOfWeekType = typeof DayOfWeek[number];

export interface DTOfindTherapists{
     username?: string,
    phone?: string,

  
    firstName?: string,
    lastName?: string,

    days?: DayOfWeekType[],
    role?: string,
    skills?:  string[],

    patients?: string[],

    isActive?:boolean,



    email?: string, 

}

export const therapistSkills=[
        "mental",
        "physical",
        "SI-PM",
        "SLP",
        "education",
        "psychologist",
        "LD",
        "massage",
      ] as const
export type therapistSkills = typeof therapistSkills[number];

      export const therapistRoles=["SLP", "OT", "PSY", "PT","therapist"]as const
export type therapistRoles = typeof therapistRoles[number];

export interface DTOmakeTherapist{
    skills?: therapistSkills[] | undefined;
    workDays?:{
        day: DayOfWeekType[]
        startTime: string;
        endTime: string;
    }[] | undefined;
    phone: string;
    role: therapistRoles;
    firstName: string;
    lastName: string;
    percentDefault: number;
    percentIntroduced: number;
}

export interface DTOeditTherapist{
    _id:string
    skills?: therapistSkills[] | undefined;
    workDays?:{
        day: DayOfWeekType[]
        startTime: string;
        endTime: string;
    }[] | undefined;
    phone: string;
    role: therapistRoles;
    firstName: string;
    lastName: string;
    percentDefault: number;
    percentIntroduced: number;
}