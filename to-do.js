"use strict";
const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const categorys = [{ id: 1, icon: 'fa fa-sun-o', name: "My Day", totalTask: "" }, 
                   { id: 2, icon: 'fa fa-star-o', name: "Important", totalTask: "" },
                   { id: 3, icon: 'fa fa-calendar', name: "Planned", totalTask: "" },
                   { id: 4, icon: 'fa fa-user-o', name: "Assigned to me", totalTask: "" },
                   { id: 5, icon: 'fa fa-home', name: "Task", totalTask: "" }];
const tasks = [];
var selectedCategory;
var selectedTask;
var categoryId = 0;
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
    renderCategory();
    defaultSelect();
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

function renderCategory() {
    contentList.innerHTML = "";

    for (let index = 0; index < categorys.length; index++) {
        var category = createElement("div", {id:categorys[index].id, className:"content-hover"});
        var iconContainer = createElement("div", {id:"", className:"side-container-icon"});
        var nameContainer = createElement("div", {id:"", className:"side-container-content"});
        var countContainer = createElement("div", {id:"", className:"side-container-count"});

        iconContainer.appendChild(createElement('i', {id:"", className:categorys[index].icon}));
        nameContainer.innerText = categorys[index].name;
        countContainer.innerText = categorys[index].totalTask;

        category.appendChild(iconContainer);
        category.appendChild(nameContainer);
        category.appendChild(countContainer);
        category.addEventListener("click", selectCategory);

        contentList.appendChild(category);
    }
}

function selectCategory() {
    let id = this.id;

    if (id == undefined) {
        id = selectedCategory.id;
    }

    for (let index = 0; index < categorys.length; index++) {

        if (id == categorys[index].id) {
            var currentCategory = document.getElementById(id);
            
            currentCategory.className = "selected-category"

            if (selectedCategory != undefined && selectedCategory.id != id) {
                var previousCategory = document.getElementById(selectedCategory.id);
                previousCategory.className = "content-hover"
            }
            selectedCategory = categorys[index];
            changeMiddleContainer();
            break;
        }
    }
    selectedTask = undefined;
    rightContainer.className = "right-container";
    middleContainer.className = "middle-container";
}

function changeMiddleContainer() {
    mainBackgroundIcon.innerHTML = "";
    mainBackgroundIcon.appendChild(createElement('i', {id:"", className:selectedCategory.icon}));
    mainBackgroundTitle.innerText = selectedCategory.name;
    renderTask();
}

function defaultSelect() {
    selectedCategory = categorys[0];
    selectCategory();
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

    for (let index = 0; index < tasks.length; index++) {

        if (selectedTask.taskId == tasks[index].taskId) {
            tasks[index].description = addNoteDiv.innerText;
            break;
        }
    }
}

function closeTask() {
    rightContainer.className = "hide";

    if (mainBackgroundIcon.className == "hide") {
        middleContainer.className = "middle-without-left";
    } else {
        middleContainer.className = "middle-container";
    }
    selectedTask = undefined;
}

function addTask() {
    
    if (event.key == 'Enter' && taskInput.value != "") {
        let important = (selectedCategory.id == 2) ? true : false;
        let categoryIds = [];

        if (selectedCategory.id < 6) {
            categoryIds.push(selectedCategory.id, 5);
        } else {
            categoryIds.push(selectedCategory.id);
        }
        tasks.push({
            categoryIds: categoryIds,
            taskId: tasks.length + 1,
            taskName: taskInput.value,
            steps: [{ id: "", stepDescription: "" }],
            description: "",
            isImportant: important,
            isCompleted: false
        });
        taskInput.value = "";
        renderTask();
    }
}

function renderTask() {
    let completedTaskCount = 0;
    let task;
    taskBackground.innerHTML = "";

    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
        task = tasks[taskIndex];

        task.categoryIds.forEach(function(value) {
            if (value == selectedCategory.id) {
                if (tasks[taskIndex].isCompleted) {
                    if (selectedCategory.id != 2) {
                        if (completedTaskCount == 0) {
                            createCompleteButton();
                        }
                        completedTaskCount++;
                        if (isCompletedTasksHidden) {
                            buildTask(taskIndex, 'beforeend');
                        }
                    }
                } else {
                    buildTask(taskIndex, 'afterbegin');
                }
            }
        });
    }
    let completedArrow = document.getElementById('completed-arrow');

    if (completedArrow != null) {
        completedArrow.className = (isCompletedTasksHidden == false) ? "show-complete" : "hide-complete";    
        document.getElementById('completed-count').innerHTML = completedTaskCount;
    } 
}

function createCompleteButton() {
    var completedButton = createElement('div', {id:"" , className:"completed-button"});
    var completeSpan = createElement('span', {id:"", className:""});
    var completeCountSpan = createElement('span', {id:"completed-count", className:"completed-count"});
    var completeArrowSpan = createElement('span', {id:"completed-arrow", className:""});
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

function buildTask(index, alignOrder) {
    var taskDiv = createElement("div", {id:"task-".concat(tasks[index].taskId), className:"task-hover"});
    var checkDiv = createElement("div", {id:"check-".concat(tasks[index].taskId), className:"check"});
    var taskAndMetaDiv = createElement("div", {id:tasks[index].taskId, className:"task-name-and-meta-data"});
    var taskNameDiv;
    var starDiv = createElement("div", {id:"star-".concat(tasks[index].taskId), className:"star"});

    if (tasks[index].isImportant == true) {
        starDiv.appendChild(createElement('i', {id:"", className:"fa fa-star"}));
    } else {
        starDiv.appendChild(createElement('i', {id:"", className:"fa fa-star-o"}));
    }

    if (tasks[index].isCompleted == true) {
        taskNameDiv = createElement("div", {id:"", className:"task-name-on-strike"});
        checkDiv.appendChild(createElement('i', {id:"", className:"fa fa-check-circle"}));
    } else {
        taskNameDiv = createElement("div", {id:"", className:"task-name"});
        checkDiv.appendChild(createElement('i', {id:"", className:"fa fa-circle-o"}));
    }
    taskNameDiv.innerText = tasks[index].taskName;
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

    for (let index = 0; index < tasks.length; index++) {

        if (tasks[index].taskId == id.split('-')[1]) {

            if (tasks[index].isCompleted == true) {
                tasks[index].isCompleted = false;
            } else {
                tasks[index].isCompleted = true;
            }

            if (selectedTask != undefined) {
                if (selectedTask.taskId == id.split('-')[1]) {
                    renderRightContainer(index);
                }
            }
            break;
        }
    }
    renderTask();
}

function setTaskImportant() {
    let id = this.id;

    for (let index = 0; index < tasks.length; index++) {

        if (tasks[index].taskId == id.split('-')[1]) {

            if (tasks[index].isImportant == true) {
                let categoryIndex = tasks[index].categoryIds.indexOf(2);
                tasks[index].categoryIds.splice(categoryIndex, categoryIndex);
                tasks[index].isImportant = false;
            } else {
                tasks[index].categoryIds.push(2);
                tasks[index].isImportant = true;
            }
            if (selectedTask != undefined) {
                if (selectedTask.taskId == id.split('-')[1]) {
                    renderRightContainer(index);
                }
            }
            break;
        }
    }
    renderTask();
}

function markTaskCompleted() {
    
    let index = tasks.indexOf(selectedTask);

    if (tasks[index].isCompleted == true) {
        tasks[index].isCompleted = false;
    } else {
        tasks[index].isCompleted = true;
    }
    renderRightContainer(index);
    renderTask();
}

function markTaskImportant() {

    for (let index = 0; index < tasks.length; index++) {

        if (selectedTask.taskId == tasks[index].taskId) {

            if (tasks[index].isImportant == true) {
                let categoryIndex = tasks[index].categoryIds.indexOf(2);
                tasks[index].categoryIds.splice(categoryIndex, categoryIndex);
                tasks[index].isImportant = false;
                rightDivImportant.innerHTML = '<i class="fa fa-star-o"></i>';
            } else {
                tasks[index].categoryIds.push(2);
                tasks[index].isImportant = true;
                rightDivImportant.innerHTML = '<i class="fa fa-star"></i>';
            }
            renderRightContainer(index);
            break;
        }
    }
    renderTask();
}

function selectTask() {
    let id = this.id;

    for (let index = 0; index < tasks.length; index++) {

        if (id == tasks[index].taskId) {

            rightContainer.className = "display-right-container";

            if (mainBackgroundIcon.className == "hide") {
                middleContainer.className = "middle-and-right";
            } else {
                middleContainer.className = "middle-with-left-and-right";
            }
            let currentTask = document.getElementById('task-'.concat(tasks[index].taskId));

            if (selectedTask != undefined) {
                let oldTask = document.getElementById('task-'.concat(selectedTask.taskId));
                oldTask.className = "task-hover"
            }
            currentTask.className = "task-selected"
            renderRightContainer(index);
            break;
        }
    }
}

function renderRightContainer(index) {

    if (tasks[index].isCompleted == true) {
        rightTaskName.classList.add('strike-name')
        rightDivCompleted.innerHTML = "";
        rightDivCompleted.appendChild(createElement('i', {id:"", className:"fa fa-check-circle"}));
    } else {
        rightTaskName.classList.remove('strike-name');
        rightDivCompleted.innerHTML = "";
        rightDivCompleted.appendChild(createElement('i', {id:"", className:"fa fa-circle-o"}));
    }

    if (tasks[index].isImportant == true) {
        rightDivImportant.innerHTML = "";
        rightDivImportant.appendChild(createElement('i', {id:"", className:"fa fa-star"}));
    } else {
        rightDivImportant.innerHTML = "";
        rightDivImportant.appendChild(createElement('i', {id:"", className:"fa fa-star-o"}));
    }
    rightTaskName.innerHTML = tasks[index].taskName;
    addNoteDiv.innerHTML = tasks[index].description;
    selectedTask = tasks[index];
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

    if (selectedTask == undefined) {
        middleContainer.className = "middle-container";
    } else {
        middleContainer.className = "middle-with-left-and-right";
    }
    mainBackgroundIcon.className = "icon";
    displaySideBarButton.classList.remove("show");
}

function addCategory() {

    if (event.key == 'Enter' && newList.value != "") {
        let newCategory = { id: categorys.length + 1, icon: 'fa fa-tasks', name: newList.value, totalTask: "" };
        categorys.push(newCategory);
        newList.value = "";
        renderCategory();
        selectedCategory = newCategory;
        selectCategory();
    }
}

init();