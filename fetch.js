//import { text } from "body-parser"

document.addEventListener("DOMContentLoaded", function () {

    let currentUser

    fetch('/session')
        .then(response => response.json())
        .then((json) => {
            currentUser = json
            return document.getElementById('session-user').innerHTML = "User: " + json
        })

    fetch('/getAllJobs')
        .then(response => response.json())
        .then((json) => {
            if (json.length == 0) {
                document.getElementById("check-Empty").innerHTML =
                    `No records exist for ${currentUser}`
            } else {
                for (let d of json) {
                    console.log(json)
                    document.getElementById("input-data").innerHTML +=
                        `
                        <tr id=${d._id}>
                            <td scope='col'> 
                                <button onclick="remove('${d._id}')" type="submit" class="btn btn-danger"> Delete Job </button>
                            </td>
                            <td scope='col'> 
                                <button class="btn btn-info" data-toggle="modal" data-target="#i-${d._id}"> More Details </button>
                            </td>                     
                            <td scope='col'> ${d.date} </td>
                            <td scope='col'> ${d.role.name} </td>
                            <td scope='col'> ${d.role.company} </td>
                            <td scope='col'> ${d.role.location} </td>
                            <td scope='col'> ${d.role.wage} </td>
                            <td scope='col'> ${d.jobBoard} </td>
                            <td scope='col'> ${d.comment} </td>
                            <td scope='col'> <a href=${d.url} target="_blank"> Go To Job </a></td>
                        </tr>

                        <div class="modal fade" id="i-${d._id}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title">Job Description</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <span aria-hidden="true">&times;</span>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <p>${d.role.description}</p>
                                </div>
                                <div class="modal-footer">
                                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                                    <button type="button" class="btn btn-primary">Save changes</button>
                                </div>
                            </div>
                        </div
                    `
                }
            }
        })
})


function alertBox() {
    navigator.clipboard.readText()
        .then(text => text.match(/workopolis|indeed|jobbank/))
        .then((result) => {
            if (result == null) {
                document.getElementById("error-notifications").innerHTML = `
                <div class="alert alert-danger" role="alert">
                    Not a valid URL. Use a URL from Indeed, Workopolis or JobBank.
                </div>
                `
            } else {
                document.getElementById("error-notifications").innerHTML =
                    `
                <div class="alert alert-success" role="alert">
                    Link appears to be valid.
                </div>
                `
            }
        })
}

function remove(key) {
    const deleteItem = [{ "id": key }]
    fetch('/removeOne', {
        method: 'DELETE',
        body: JSON.stringify(deleteItem),
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        }
    })

    document.getElementById(`${key}`).remove()
}



