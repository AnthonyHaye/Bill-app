export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  
  if (isNaN(date.getTime())) { // Vérifie si la date est invalide
    return dateStr; // Renvoie la date non formatée si invalide
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); 
  const day = String(date.getDate()).padStart(2, '0'); 
  return `${year}-${month}-${day}`;
}
 
export const formatStatus = (status) => {
  switch (status) {
    case "pending":
      return "En attente"
    case "accepted":
      return "Accepté"
    case "refused":
      return "Refused"
    default :
      return status;
  }
}