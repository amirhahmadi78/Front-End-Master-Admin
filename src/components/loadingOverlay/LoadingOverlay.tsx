import { useLoadingStore } from "../../store/loading.store";
import "./LoadingOverlay.css";

export const LoadingOverlay = () => {
  const loading = useLoadingStore((s) => s.loading);

  if (!loading) return null;

  return (
    <div className="overlay-container">
      <div className="loader-box">
        <div className="spinner"></div>
        <div className="loading-text">در حال پردازش...</div>
      </div>
    </div>
  );
};



export const ModalLoading=()=>{
  return(
     <div className="overlay-container">
      <div className="loader-box">
        <div className="spinner"></div>
        <div className="loading-text">در حال پردازش...</div>
      </div>
    </div>
  )
}
