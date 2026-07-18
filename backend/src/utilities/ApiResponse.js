class ApiResponse{
    constructor(
        statauscode,
        message="Success",
        data
    ){
        this.statauscode=statauscode;
        this.message=message;
        this.data=data;
        this.success=statuscode < 400
    }
}

export {ApiResponse};