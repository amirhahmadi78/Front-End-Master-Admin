import { therapistsForTherapist } from "../services/therapist"
import { QueryService } from "../utils/customHooks"

export const useListTherapists=()=>{
    return QueryService.GetQuery(
        ["therapists-fortherapist"],
        ()=>therapistsForTherapist(),
        {
            initialData:[]
        }
    )
}