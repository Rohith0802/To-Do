const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const categorys = [{id:"my-day", icon:'<i class="fa fa-sun-o"></i>', name:"My Day", totalTask:""}, {id:"important", icon:'<i class="fa fa-star-o"></i>', name:"Important", totalTask:""},
                  {id:"planned", icon:'<i class="fa fa-calendar"></i>', name:"Planned", totalTask:""}, {id:"assigned", icon:'<i class="fa fa-user-o"></i>', name:"Assigned to me", totalTask:""}, 
                  {id:"Task", icon:'<i class="fa fa-home"></i>', name:"Task", totalTask:""}];
const tasks = [];
var selectedCategory;
var selectedTask;
var categoryId = 0;
const headerDate = document.getElementById("header-date");
const contentList = document.getElementById("content-list");
const newList  = document.getElementById("new-list");
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
const currentTask = {}

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

function createElement(elementName) {
    return document.createElement(elementName);
}

function renderCategory() {
    contentList.innerHTML = "";

    for (let index = 0; index < categorys.length; index++) {
        var category = createElement("div");
        var iconContainer = createElement("div");
        var nameContainer = createElement("div");
        var countContainer = createElement("div");

        category.classList.add("content");
        category.classList.add("content-hover");
        iconContainer.classList.add("side-container-icon");
        nameContainer.classList.add("side-container-content");
        countContainer.classList.add("side-container-count");

        iconContainer.innerHTML = categorys[index].icon;
        nameContainer.innerHTML = categorys[index].name;
        countContainer.innerHTML = categorys[index].totalTask;

        category.appendChild(iconContainer);
        category.appendChild(nameContainer);
        category.appendChild(countContainer);
        category.addEventListener("click", selectCategory);
        category.setAttribute('id', categorys[index].id);

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
            currentCategory.classList.remove("content-hover");
            currentCategory.classList.add("selected");
            
            if (selectedCategory != undefined && selectedCategory.id != id) {
                var previousCategory = document.getElementById(selectedCategory.id);
                previousCategory.classList.remove("selected");
                previousCategory.classList.add("content-hover");
            }
            selectedCategory = categorys[index];
            changeMiddleContainer();
            break;
        }
    }
}

function changeMiddleContainer() {
    mainBackgroundIcon.innerHTML = selectedCategory.icon;
    mainBackgroundTitle.innerHTML = selectedCategory.name;
    renderTask();
}

function defaultSelect() {
    selectedCategory = categorys[0];
    selectCategory();
}

function setEvents() {
    newList.addEventListener("keydown", addList);
    document.getElementById("side-bar-button").addEventListener("click", hideSideBar);
    document.getElementById("display-side-bar").addEventListener("click", displaySideBar);
    taskInput.addEventListener("keydown", addTask);
    closeTaskButton.addEventListener('click', closeTask);
}

function closeTask() {
    rightContainer.className = "hide";
}

function addTask() {

    if (event.key == 'Enter' && taskInput.value != "") {
        tasks.push({categoryId:selectedCategory.id, taskId: tasks.length+1, taskName: taskInput.value, steps:[{id:"", stepDescription:""}], description:""});
        taskInput.value = "";
        renderTask();
    }    
}

function renderTask() {
    taskBackground.innerHTML = "";

    for (let index = 0; index < tasks.length; index++) {
        
        if (selectedCategory.id == tasks[index].categoryId) {
            var taskDiv = createElement("div");
            var checkDiv = createElement("div");
            var taskAndMetaDiv = createElement("div");
            var taskNameDiv = createElement("div");
            var starDiv = createElement("div");

            checkDiv.innerHTML = '<i class="fa fa-square-o"></i>';
            starDiv.innerHTML = '<i class="fa fa-star-o"></i>';
            taskNameDiv.innerHTML = tasks[index].taskName;

            taskDiv.classList.add("task");
            taskDiv.classList.add("content-hover")
            checkDiv.classList.add("check");
            taskAndMetaDiv.classList.add("task-name-and-meta-data");
            taskNameDiv.classList.add("task-name");
            starDiv.classList.add("star");

            taskAndMetaDiv.appendChild(taskNameDiv);
            taskDiv.appendChild(checkDiv);
            taskDiv.appendChild(taskAndMetaDiv);
            taskDiv.appendChild(starDiv);
            taskDiv.setAttribute('id', tasks[index].taskId)
            taskDiv.addEventListener('click', selectTask);

            taskBackground.appendChild(taskDiv);
        }
    }
}

function selectTask() {
    let id = this.id;

    for (let index = 0; index < tasks.length; index++) {

        if (id == tasks[index].taskId) {
            rightContainer.className = "right-container";
            rightTaskName.innerHTML = tasks[index].taskName;
            selectedTask = tasks[index];
        }
    }
}

function hideSideBar() {
    // leftContainer.classList.remove("left-container");
    leftContainer.classList.add("hide");
    middleContainer.classList.add("middle-without-left");
    mainBackgroundIcon.classList.remove("icon");
    mainBackgroundIcon.classList.add("hide");
    displaySideBarButton.classList.add("show");
}

function displaySideBar() {
    leftContainer.classList.remove("hide");
    // leftContainer.classList.add("left-container");
    middleContainer.classList.remove("middle-without-left");
    // middleContainer.classList.add("middle-container");
    mainBackgroundIcon.classList.add("icon");
    displaySideBarButton.classList.remove("show");
}

function addList() {

    if (event.key == 'Enter' && newList.value != "") {
        let newCategory = {id: categoryId++, icon:'<i class="fa fa-tasks"></i>', name:newList.value, totalTask:""};
        categorys.push(newCategory);
        newList.value = "";
        renderCategory();
        selectedCategory = newCategory;
        selectCategory();
    }
}

init();