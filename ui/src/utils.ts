
export const handleAPIError = (error: any, notify: any) => {
    if(error?.response?.data?.error) {
        if(typeof error?.response?.data?.error === "string") {
            notify?.open({
                type: "error",
                message: error?.response?.data?.error
            })
        } else {
            notify?.open({
                type: "error",
                message: error?.response?.statusText
            })
        }
    } else {
        const statusCode = error?.statusCode
        if(statusCode === 0) {
            notify?.open({
                type: "error",
                message: "Vérifiez que vous êtes connecté à Internet !"
            })    
        } else if(statusCode == 422) {
            notify?.open({
                type: "error",
                message: "Les informations entrées sont incorrectes !"
            })
        } else {
            notify?.open({
                type: "error",
                message: "Une erreur s'est produite. Veuillez reessayer !"
            })
        }
    }
}
