class Department {
    constructor(name){
        this.name = name;
        this.teams = [];
    }
    addTeam(empId, name, position){
        this.teams.push(new Team(empId, name, position));
    }
}

class Team {
    constructor (empId, name, position){
        this.empId = empId;
        this.name = name;
        this.position = position;
    }
}

class DepartmentService {
    // have to generate new endpoints every 24hrs
    static url = "https://crudcrud.com/api/31773923e17548ebb589ed80ba45ff4d/departments";
    
    static getAllDepartments () {
        return $.get(this.url);
    }
    
    static getDepartment (id) {
        return $.get (this.url + `/${id}`);
    }

    static createDepartment (department) {
        return $.ajax ({
            url : this.url ,
            dataType : "json",
            data : JSON.stringify(department),
            contentType : "application/json",
            type : "POST"

        });
    }

    static updateDepartment(department) {
        const id = department._id;
        delete department._id;
        return $.ajax({
            url : `${this.url}/${id}`,
            data : JSON.stringify(department),
            contentType : "application/json",
            crossDomain : true,
            type : "PUT",
        });
    }

    static deleteDepartment(id){
        return $.ajax({
            url: this.url + `/${id}` ,
            type : "DELETE"
        });
    }
    
}

class DOMManager {
    static departments;

    static getAllDepartments() {
        DepartmentService.getAllDepartments()
        .then(departments => this.render(departments));
    }

    static createDepartment(name){
        DepartmentService.createDepartment(new Department(name))
        .then(() => {
            return DepartmentService.getAllDepartments();
        })
        .then((departments) => this.render(departments));
    }

    static deleteDepartment(id){
        DepartmentService.deleteDepartment(id)
        .then(()=>{
            return DepartmentService.getAllDepartments();
        })
        .then((departments)=>this.render(departments));
    }

    static addTeam(id){
        for (let department of this.departments) {
            if(department._id == id) {
                department.teams.push(
                    new Team(
                        
                        $(`#${department._id}-empId`).val(),
                        $(`#${department._id}-name`).val(),
                        $(`#${department._id}-position`).val(),
                    )
                );
                DepartmentService.updateDepartment(department)
                .then(() => {
                    return DepartmentService.getAllDepartments();
                })
                .then((departments) => this.render(departments));

            }
        }
    }

    static deleteTeam(departmentId, teamId){
        for(let department of this.departments){
            if(department._id == departmentId){
                for(let team of department.teams){
                    if(team.name == teamId){
                        department.teams.splice(department.teams.indexOf(team),1);
                        DepartmentService.updateDepartment(department)
                        .then(() => {
                            return DepartmentService.getAllDepartments();
                        })
                        .then((departments) => this.render(departments));
                        
                    }
                }
            }
        }
    }

    static render(departments) {
        this.departments = departments;
        $("#apps").empty();
        for (let department of departments) {
            $("#apps").prepend (
                `<div id = "${department._id}" class="card mycard">
                    <div class = "card-header">
                        <h3>${department.name}</h3>
                        <i onClick = "DOMManager.deleteDepartment('${department._id}')" class="bi bi-trash text-muted"></i>
                    <div class="card-body ">
                        <div class = "card">
                            <div class = "row">
                                <div class = "col-sm">
                                    <input type = "text" id = "${department._id}-empId" class="form-control myform" placeholder = "Employee ID">
                                </div>
                            </div>
                            <div class = "row">
                                <div class = "col-sm">
                                    <input type = "text" id = "${department._id}-name" class="form-control myform" placeholder = "Employee Name">
                                </div>
                            </div>
                            <div class = "row">
                                <div class = "col-sm">
                                    <input type = "text" id = "${department._id}-position" class="form-control myform" placeholder = "Position">
                                </div>
                            </div>
                                <button id = "${department._id}-new-team" 
                                onclick="DOMManager.addTeam('${department._id}')" class=" btn btn-default form-control mybutton">Add Team</button>
                        </div>
                    </div>
                </div>`
            );
            for (let team of department.teams) {
                $(`#${department._id}`).find(".card-body").append(
                    `<p>
                    <span id="empId-${team._id}"><strong>EmpID : </strong> ${team.empId}</span><br>
                    <span id="name-${team._id}"><strong>Name : </strong> ${team.name}</span><br>
                    <span id="position-${team._id}"><strong>Position : </strong> ${team.position}</span><br>
                    <i onClick = "DOMManager.deleteTeam('${department._id}','${team.name}')" class="bi bi-trash text-muted"></i>
                    `
                );
            }
        }
    }
}
$("#create-new-department").click(() => {
    DOMManager.createDepartment($("#new-department-name").val());
    $("#new-department-name").val(""); // reset the form after a department is created
});

DOMManager.getAllDepartments();