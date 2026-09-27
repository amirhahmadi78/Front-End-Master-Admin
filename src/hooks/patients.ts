import { GetMyPatients, patientsForTherapist } from "../services/patients"
import { QueryService } from "../utils/customHooks"

export const useMyPatients=()=>{
    return QueryService.GetQuery(
        ["patients"],
        ()=>GetMyPatients()
    )
}



export const useListPatients=()=>{
    return QueryService.GetQuery(
        ["patients-fortherapist"],
        ()=>patientsForTherapist(),{
            initialData:[]
        }
    )
}