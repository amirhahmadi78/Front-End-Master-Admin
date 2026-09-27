import Swal from "sweetalert2";

 class Alert{
    backEndError(error:unknown,text:string) {
        return Swal.fire({
                    title: "خطای سرور!",
                    text: error?.response?.data?.message||text,
                    icon: "error",
                  });}


    succes(text:string){
       return  Swal.fire({
                    title: "موفق",
                    text: text,
                    icon: "success",
                  });
    }

     Error(text:string) {
        return Swal.fire({
                    title: "خطا!",
                    text: text,
                    icon: "error",
                  });}

    doYouWant(text:string,confirmBTN?:string){
     return  Swal.fire({
            title: "لطفا توجه فرمایید!",
            text: text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: confirmBTN||"بعله  حذف شود!",
            cancelButtonText: "خیر",
          })
    }

    info(text:string){
       return  Swal.fire({
            title: "لطفا توجه فرمایید!",
            text: text,
            icon: "info",
           
            confirmButtonColor: "#3085d6",
         
            confirmButtonText: "تایید!",
          
          })
    }
   
}
export const AlertSwal=new Alert