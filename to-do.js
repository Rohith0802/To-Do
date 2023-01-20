import  {getOrSaveDetails} from "/fetchapi.js";
const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
// const categorys = [{ id: 1, icon: 'fa fa-sun-o', name: "My Day", totalTask: "" }, 
//                    { id: 2, icon: 'fa fa-star-o', name: "Important", totalTask: "" },
//                    { id: 3, icon: 'fa fa-calendar', name: "Planned", totalTask: "" },
//                    { id: 4, icon: 'fa fa-user-o', name: "Assigned to me", totalTask: "" },
//                    { id: 5, icon: 'fa fa-home', name: "Task", totalTask: "" }];
const tasks = [];
var temporaryCategory = [];
var selectedCategoryId = 1;
var selectedTask;
const headerDate = document.getElementById("header-date");
const contentList = document.getElementById("content-list");
const newList = document.getElementById("new-list");
const taskInput = document.getElementById("add-task");
const leftContainer = document.getElementById("left-container");
const middleContainer = document.getElementById("middle-container")
const mainBackgroundIcon = document.getElementById("main-background-icon");
const mainBackgroundTitle = document.getElementById("main-background-title");
const displaySideBarButton = document.getElementById("display-side-bar");
const taskBackground = document.getElementById("task-background");
const closeTaskButton = document.getElementById("close-task");
const rightContainer = document.getElementById("right-container");
const rightTaskName = document.getElementById("right-task-name");
const addNoteDiv = document.getElementById("add-note");
const rightDivCompleted = document.getElementById("completed");
const rightDivImportant = document.getElementById("important");
var isCompletedTasksHidden = false;

function init() {
    setDate();
    setEvents();
    buildCategory();
}

function setDate() {
    const date = new Date();
    headerDate.innerHTML = day[date.getDay()].concat(", ", month[date.getMonth()], " ", date.getDate().toString());
}

function createElement(elementName, attributes) {
    let element = document.createElement(elementName);

    if (attributes.id != "") {
        element.setAttribute('id', attributes.id);
    }

    if (attributes.className != "") {
        element.setAttribute('class', attributes.className);
    }
    return element;
}

function buildCategory() {
    var result = getOrSaveDetails("/categories", "GET");
    
    result.then((categorys) => {
        contentList.innerHTML = "";
		temporaryCategory = categorys;
        categorys.forEach((category) => {
			renderCategory(category);
		});
        selectCategory();
    });
}

function renderCategory(category) {
    var categoryDiv = createElement("div", {id:category.id, className:"content-hover"});
    var iconContainer = createElement("div", {id:"", className:"side-container-icon"});
    var nameContainer = createElement("div", {id:"", className:"side-container-content"});
    var countContainer = createElement("div", {id:"", className:"side-container-count"});

    iconContainer.appendChild(createElement('i', {id:"", className:category.iconClass}));
    nameContainer.innerText = category.name;

    if (category.count != 0) {
        countContainer.innerText = category.count;
    }
    categoryDiv.appendChild(iconContainer);
    categoryDiv.appendChild(nameContainer);
    categoryDiv.appendChild(countContainer);
    categoryDiv.addEventListener("click", selectCategory);

    contentList.appendChild(categoryDiv);

    if (category.id == 5) {
        contentList.appendChild(createElement("div", {id:"", className:"break-category"}));
    }
}

function selectCategory() {
    let id = (this == undefined) ? selectedCategoryId : this.id;

	for (let category of temporaryCategory) {

		if (id == category.id) {
			var currentCategory = document.getElementById(id);
			
			currentCategory.className = "selected-category"

			if (selectedCategoryId != id) {
				var previousCategory = document.getElementById(selectedCategoryId);
				previousCategory.className = "content-hover"
			}
			selectedCategoryId = category.id;
			mainBackgroundIcon.innerHTML = "";
			mainBackgroundIcon.appendChild(createElement('i', {id:"", className:category.iconClass}));
			mainBackgroundTitle.innerText = category.name;
			renderTask();
			break;
		}
	}
    selectedTask = undefined;
    rightContainer.className = "right-container";
    middleContainer.className = "middle-container";
}

function setEvents() {
    newList.addEventListener("keydown", addCategory);
    document.getElementById("side-bar-button").addEventListener("click", hideSideBar);
    document.getElementById("display-side-bar").addEventListener("click", displaySideBar);
    taskInput.addEventListener("keydown", addTask);
    closeTaskButton.addEventListener('click', closeTask);
    addNoteDiv.addEventListener('blur', getNote);
    rightDivCompleted.addEventListener('click', markTaskCompleted);
    rightDivImportant.addEventListener('click', markTaskImportant);
}

function getNote() {
	getOrSaveDetails("/tasks/".concat(selectedTask.id), "GET").then((task) => {
		task.note = addNoteDiv.innerText;
		getOrSaveDetails("/task", "POST", task);
	});
}

function closeTask() {
    rightContainer.className = "hide";

    if (mainBackgroundIcon.className == "hide") {
        middleContainer.className = "middle-without-left";
    } else {
        middleContainer.className = "middle-container";
    }
    // selectedTask = undefined;
}

function addTask() {
    
    if (event.key == 'Enter' && taskInput.value != "") {
        let important = (selectedCategoryId == 2) ? true : false;
        let categoryIds = [];

        if (selectedCategoryId < 5) {
            categoryIds.push(selectedCategoryId, 5);
        } else {
            categoryIds.push(selectedCategoryId);
        }
        let newTask = {
            categoryIds: categoryIds,
            id: 0,
            name: taskInput.value,
            note: "",
            isImportant: important,
            isCompleted: false
        };
        getOrSaveDetails("/task", "POST", newTask).then(() => {
            renderTask();
        });
        taskInput.value = "";
    }
}

function renderTask() {
    let completedTaskCount = 0;
    let result = getOrSaveDetails("/tasks", "GET");

    taskBackground.innerHTML = "";

    result.then((tasks) => {
        for (let task of tasks) {
            task.categoryIds.forEach((value) => {

                if (value == selectedCategoryId) {
                    if (task.isCompleted) {
                        if (selectedCategoryId != 2) {

                            if (completedTaskCount == 0) {
                                createCompleteButton();
                            }
                            completedTaskCount++;
                            if (isCompletedTasksHidden) {
                                buildTask(task, 'beforeend');
                            }
                        }
                    } else {
                        buildTask(task, 'afterbegin');
                    }
                }
            });
        }
		let completedArrow = document.getElementById("completed-arrow");

		if (completedArrow != null) {
			completedArrow.className = (isCompletedTasksHidden == false) ? "hide-complete" : "show-complete";    
			document.getElementById('completed-count').innerHTML = completedTaskCount;
		}
    });
     
}

function createCompleteButton() {
    var completedButton = createElement('div', {id:"" , className:"completed-button"});
    var completeSpan = createElement('span', {id:"", className:""});
    var completeCountSpan = createElement('span', {id:"completed-count", className:"completed-count"});
    var completeArrowSpan = createElement('span', {id:"completed-arrow", className:"hide-complete"});
    var arrowIcon = createElement('i', {id:"", className:"fa fa-sort-down"});

    completeSpan.innerText = 'Completed';

    completeArrowSpan.appendChild(arrowIcon);
    completedButton.appendChild(completeArrowSpan);
    completedButton.appendChild(completeSpan);
    completedButton.appendChild(completeCountSpan);
    completedButton.addEventListener('click', toggleCompletedTask);
    taskBackground.appendChild(completedButton);
}

function toggleCompletedTask() {

    if (isCompletedTasksHidden == false) {
        isCompletedTasksHidden = true;
    } else {
        isCompletedTasksHidden = false;
    }
    renderTask();
}

function buildTask(task, alignOrder) {
    var taskNameDiv;
    var taskDiv = createElement("div", {id:"task-".concat(task.id), className:"task-hover"});
    var checkDiv = createElement("div", {id:"check-".concat(task.id), className:"check"});
    var taskAndMetaDiv = createElement("div", {id:task.id, className:"task-name-and-meta-data"});
    var starDiv = createElement("div", {id:"star-".concat(task.id), className:"star"});

    if (task.isImportant == true) {
        starDiv.appendChild(createElement('i', {id:"", className:"fa fa-star"}));
    } else {
        starDiv.appendChild(createElement('i', {id:"", className:"fa fa-star-o"}));
    }

    if (task.isCompleted == true) {
        taskNameDiv = createElement("div", {id:"", className:"task-name-on-strike"});
        checkDiv.appendChild(createElement('i', {id:"", className:"fa fa-check-circle"}));
    } else {
        taskNameDiv = createElement("div", {id:"", className:"task-name"});
        checkDiv.appendChild(createElement('i', {id:"", className:"fa fa-circle-o"}));
    }
    taskNameDiv.innerText = task.name;
    taskAndMetaDiv.addEventListener('click', selectTask);
    starDiv.addEventListener('click', setTaskImportant);
    checkDiv.addEventListener('click', setTaskCompleted);

    taskAndMetaDiv.appendChild(taskNameDiv);
    taskDiv.appendChild(checkDiv);
    taskDiv.appendChild(taskAndMetaDiv);
    taskDiv.appendChild(starDiv);

    taskBackground.insertAdjacentElement(alignOrder, taskDiv);
}

function setTaskCompleted() {
    let id = this.id;
    getOrSaveDetails("/tasks/".concat(id.split('-')[1]), "GET").then((task) => {

        if (task.isCompleted == true) {
            task.isCompleted = false;
        } else {
        	task.isCompleted = true;
        }

		if (selectedTask != undefined && selectedTask.id == id.split('-')[1]) {
			renderRightContainer(task);
		}
        getOrSaveDetails("/task", "POST", task).then(() => renderTask());
    });
}

function setTaskImportant() {
    let id = this.id;

    getOrSaveDetails("/tasks/".concat(id.split('-')[1]), "GET").then((task) => {

        if (task.isImportant == true) {
            let categoryIndex = task.categoryIds.indexOf(2);
            task.categoryIds.splice(categoryIndex, categoryIndex);
            task.isImportant = false;
        } else {
            task.categoryIds.push(2);
            task.isImportant = true;
        }

		if (selectedTask != undefined && selectedTask.id == id.split('-')[1]) {
			renderRightContainer(task);
		}
        getOrSaveDetails("/task", "POST", task).then(renderTask());
    });
}

function markTaskCompleted() {
    getOrSaveDetails("/tasks/".concat(selectedTask.id), "GET").then((task) => {

        if (task.isCompleted == true) {
            task.isCompleted = false;
        } else {
            task.isCompleted = true;
        }
		renderRightContainer(task);
        getOrSaveDetails("/task", "POST", task).then(() => renderTask());
    });
}

function markTaskImportant() {
    getOrSaveDetails("/tasks/".concat(selectedTask.id), "GET").then((task) => {

        if (task.isImportant == true) {
            let categoryIndex = task.categoryIds.indexOf(2);
            task.categoryIds.splice(categoryIndex, categoryIndex);
            task.isImportant = false;
            // rightDivImportant.appendChild(createElement('i', {id:"", className:"fa fa-star-o"}));
        } else {
            task.categoryIds.push(2);
            task.isImportant = true;
            // rightDivImportant.appendChild(createElement('i', {id:"", className:"fa fa-star"}));
        }
        renderRightContainer(task);

		getOrSaveDetails("/task", "POST", task).then(() => renderTask());
    });
}

function selectTask() {
    let id = this.id;

    getOrSaveDetails("/tasks/".concat(id), "GET").then((task) => {

		rightContainer.className = "display-right-container";

		if (mainBackgroundIcon.className == "hide") {
			middleContainer.className = "middle-and-right";
		} else {
			middleContainer.className = "middle-with-left-and-right";
		}
		let currentTask = document.getElementById('task-'.concat(task.id));

		if (selectedTask != undefined) {
			let oldTask = document.getElementById('task-'.concat(selectedTask.id));
			oldTask.className = "task-hover"
		}
		currentTask.className = "task-selected"
		renderRightContainer(task);    
    });
}

function renderRightContainer(task) {

    if (task.isCompleted == true) {
        rightTaskName.classList.add('strike-name')
        rightDivCompleted.innerHTML = "";
        rightDivCompleted.appendChild(createElement('i', {id:"", className:"fa fa-check-circle"}));
    } else {
        rightTaskName.classList.remove('strike-name');
        rightDivCompleted.innerHTML = "";
        rightDivCompleted.appendChild(createElement('i', {id:"", className:"fa fa-circle-o"}));
    }

    if (task.isImportant == true) {
        rightDivImportant.innerHTML = "";
        rightDivImportant.appendChild(createElement('i', {id:"", className:"fa fa-star"}));
    } else {
        rightDivImportant.innerHTML = "";
        rightDivImportant.appendChild(createElement('i', {id:"", className:"fa fa-star-o"}));
    }
    rightTaskName.innerHTML = task.name;
    addNoteDiv.innerHTML = task.note;
    selectedTask = task;
}

function hideSideBar() {
    leftContainer.classList.add("hide");

    if (selectedTask == undefined) {
        middleContainer.className = "middle-without-left";
    } else {
        middleContainer.className = "middle-and-right";
    }
    mainBackgroundIcon.classList.remove("icon");
    mainBackgroundIcon.className = "hide";
    displaySideBarButton.classList.add("show");
}

function displaySideBar() {
    leftContainer.classList.remove("hide");

    if (rightContainer != "display-right-container") {
        middleContainer.className = "middle-container";
    } else {
        middleContainer.className = "middle-with-left-and-right";
    }
    mainBackgroundIcon.className = "icon";
    displaySideBarButton.classList.remove("show");
}

function addCategory() {

    if (event.key == 'Enter' && newList.value != "") {
        let newCategory = { id:0, iconClass: 'fa fa-tasks', name: newList.value, count:0 };

        getOrSaveDetails("/category", 'POST', newCategory).then((value) => {
            newList.value = "";
            selectedCategoryId = value;
            buildCategory();
            // selectCategory();
        });
    }
}

init();