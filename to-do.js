import { getOrSaveDetails } from "./fetchapi.js";

(function () {
    var temporaryCategory = [];
    var selectedCategoryId = 1;
    var selectedTask;
    const headerDate = document.getElementById("header-date");
    const contentList = document.getElementById("content-list");
    const categoryInput = document.getElementById("add-category");
    const taskInput = document.getElementById("add-task");
    const leftContainer = document.getElementById("left-container");
    const middleContainer = document.getElementById("middle-container")
    const mainBackgroundIcon = document.getElementById("main-background-icon");
    const mainBackgroundTitle = document.getElementById("main-background-title");
    const displaySideBarButton = document.getElementById("display-side-bar");
    const taskBackground = document.getElementById("task-background");
    const closeTaskButton = document.getElementById("close-task");
    const rightContainer = document.getElementById("right-container");
    const addNoteDiv = document.getElementById("add-note");
    const rightTask = document.getElementById("right-task");
    var isCompletedTasksHidden = false;

    /**
     * The function init() sets event, date and necessary elements and render categorys 
     * and there task.
     */
    function init() {
        setDate();
        setEvents();
        buildCategory();
    }

    /**
     * The function setDate() creates date object and set date to webpage in a specific format.
     * for example: Monday,June 20
     */
    function setDate() {
        const date = new Date();
        const options = {
            weekday: "long",
            month: "long",
            day: "numeric"
        };

        headerDate.innerHTML = date.toLocaleDateString("en-US", options);
    }


    /**
     * It creates an element with the name you pass in, and then sets the id and class attributes if
     * you pass in a value for them.
     * 
     * @param elementName The name of the element you want to create.
     * @param attributes The object contains set of properties such element id and class name.
     * @returns The element that was created.
     */
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

    /**
     * This function is called when the page loads and it gets the list of categories 
     * from the serverand displays them in the category list.
     */
    function buildCategory() {

        getOrSaveDetails("/categories", "GET").then((categorys) => {
            contentList.innerHTML = "";
            temporaryCategory = categorys;
            categorys.forEach((category) => {
                renderCategory(category);
            });
            selectCategory();
        });
    }


    /**
     * This function creates set of elements and build a category with given category object details. 
     * 
     * @param category A object contains id, name, iconClass and taskCount of a category.
     */
    function renderCategory(category) {
        var categoryDiv = createElement("div", { id: category.id, className: "content-hover" });
        var iconContainer = createElement("div", { id: "", className: "side-container-icon" });
        var nameContainer = createElement("div", { id: "", className: "side-container-content" });
        var countContainer = createElement("div", { id: "", className: "side-container-count" });

        iconContainer.appendChild(createElement('i', { id: "", className: category.iconClass }));
        nameContainer.innerText = category.name;

        if (category.count > 0) {
            countContainer.innerText = category.count;
        }
        categoryDiv.appendChild(iconContainer);
        categoryDiv.appendChild(nameContainer);
        categoryDiv.appendChild(countContainer);
        categoryDiv.addEventListener("click", selectCategory);

        contentList.appendChild(categoryDiv);

        if (category.id == 5) {
            contentList.appendChild(createElement("div", { id: "", className: "break-category" }));
        }
    }

    /**
     * It's a function that changes the class name of the selected category to highlight and 
     * changes the previously selected cateogry to previous class name.
     */
    function selectCategory() {
        let id;
        
        if (this == undefined) {
            id = selectedCategoryId;
        } else {
            id = this.id;
            selectedTask = undefined;
        }

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
                mainBackgroundIcon.appendChild(createElement('i', { id: "", className: category.iconClass }));
                mainBackgroundTitle.innerText = category.name;
                buildTask();
                break;
            }
        }
        // selectedTask = undefined;
    }


    /**
     * It adds event listeners to the elements in the DOM.
     */
    function setEvents() {
        categoryInput.addEventListener("keydown", addCategory);
        document.getElementById("side-bar-button").addEventListener("click", hideSideBar);
        document.getElementById("display-side-bar").addEventListener("click", displaySideBar);
        taskInput.addEventListener("keydown", addTask);
        closeTaskButton.addEventListener('click', closeTask);
        addNoteDiv.addEventListener('blur', getNote);
    }

    /**
     * This function gets note added to a task and update it to database.
     */
    function getNote() {
        getOrSaveDetails("/tasks/".concat(selectedTask.id), "GET").then((task) => {
            task.note = addNoteDiv.innerText;
            getOrSaveDetails("/task", "POST", task);
        });
    }

    /**
     * This function changes element of middle container when the 
     * right container is closed.
     */
    function closeTask() {
        rightContainer.className = "hide";
        middleContainer.className = (mainBackgroundIcon.className != "hide")
            ? "middle-container" : "middle-without-left";
    }

    /**
     * This function takes value from taskInput when enter key is pressed and 
     * create a new task if input field is not empty.
     */
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
            saveTask(newTask);
            taskInput.value = "";
        }
    }


    /**
     * This funciton save the newly added task and update the current category task count
     *  and rebuild the category.
     * 
     * @param task A task object need to be saved.
     */
    function saveTask(task) {
        let categories = []
        getOrSaveDetails("/task", "POST", task).then(() => {
            temporaryCategory.forEach(category => {
                if (category.id == selectedCategoryId) {
                    category.count += 1;
                    categories.push(category);

                    if (selectedCategoryId < 6) {
                        temporaryCategory[4].count++;
                        categories.push(temporaryCategory[4]);
                    }
                    getOrSaveDetails("/categorys", "POST", categories).then(() => {
                        buildCategory();
                    });
                }
            })
        });
    }

    /**
     * This function get tasks from server and build the task based on the selected category
     * and render task based on ther completion.
     */
    function buildTask() {
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
                                    renderTask(task, 'beforeend');
                                }
                            }
                        } else {
                            renderTask(task, 'afterbegin');
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

    /**
     * This funciton creates a button that when clicked, will toggle the
     * visibility of the completed tasks.
     */
    function createCompleteButton() {
        var completedButton = createElement('div', { id: "", className: "completed-button" });
        var completeSpan = createElement('span', { id: "", className: "" });
        var completeCountSpan = createElement('span', { id: "completed-count", className: "completed-count" });
        var completeArrowSpan = createElement('span', { id: "completed-arrow", className: "hide-complete" });
        var arrowIcon = createElement('i', { id: "", className: "fa fa-sort-down" });

        completeSpan.innerText = 'Completed';

        completeArrowSpan.appendChild(arrowIcon);
        completedButton.appendChild(completeArrowSpan);
        completedButton.appendChild(completeSpan);
        completedButton.appendChild(completeCountSpan);
        completedButton.addEventListener('click', toggleCompletedTask);
        taskBackground.appendChild(completedButton);
    }

    /**
     * If the completed tasks are hidden, then show them. If the completed tasks are not hidden, then
     * hide them.
     */
    function toggleCompletedTask() {
        isCompletedTasksHidden = (isCompletedTasksHidden == false) ? true : false;
        buildTask();
    }

    /**
     * Creates elements task attributes and append it to DOM in a specified alignOrder.
     * 
     * @param task - Task object that need to be build in element with given property of a object.
     * @param alignOrder - "afterbegin" or "beforeend".
     */
    function renderTask(task, alignOrder) {
        var taskNameDiv;
        var taskDiv = createElement("div", { id: "task-".concat(task.id), className: "task-hover" });
        var checkDiv = createElement("div", { id: "check-".concat(task.id), className: "check" });
        var taskAndMetaDiv = createElement("div", { id: task.id, className: "task-name-and-meta-data" });
        var starDiv = createElement("div", { id: "star-".concat(task.id), className: "star" });

        if (task.isImportant == true) {
            starDiv.appendChild(createElement('i', { id: "", className: "fa fa-star" }));
        } else {
            starDiv.appendChild(createElement('i', { id: "", className: "fa fa-star-o" }));
        }

        if (task.isCompleted == true) {
            taskNameDiv = createElement("div", { id: "", className: "task-name-on-strike" });
            checkDiv.appendChild(createElement('i', { id: "", className: "fa fa-check-circle" }));
        } else {
            taskNameDiv = createElement("div", { id: "", className: "task-name" });
            checkDiv.appendChild(createElement('i', { id: "", className: "fa fa-circle-o" }));
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

    /**
     * The function gets the task from the server, toggles the isCompleted
     * property, and then sends the task back to the server when a task is clicked.
     */
    function setTaskCompleted() {
        let id = this.id;
        let categories = [];

        getOrSaveDetails("/tasks/".concat(id.split('-')[1]), "GET").then((task) => {
            temporaryCategory.forEach((category) => {
                if (category.id == selectedCategoryId) {
                    if (task.isCompleted == true) {
                        task.isCompleted = false;
                        category.count++;
                        categories.push(category);
                        if (category.id < 6) {
                            temporaryCategory[4].count++;
                            categories.push(temporaryCategory[4]);
                        }
                        console.log(category);
                        if (task.isImportant == true) {
                            console.log('working')
                            temporaryCategory[1].count++;
                            categories.push(temporaryCategory[1]);
                        }
                    } else {
                        task.isCompleted = true;
                        category.count--;
                        categories.push(category);
                        if (category.id < 6) {
                            temporaryCategory[4].count--;
                            categories.push(temporaryCategory[4]);
                        }
                        if (task.isImportant == true) {
                            temporaryCategory[1].count--;
                            categories.push(temporaryCategory[1]);
                        }
                    }
                }
            });

            if (selectedTask != undefined && selectedTask.id == id.split('-')[1]) {
                renderRightContainer(task);
            }
            getOrSaveDetails("/categorys", "POST", categories).then(() => {
                getOrSaveDetails("/task", "POST", task).then(() => buildCategory());
            })
        });
    }

    /**
     * The function gets the task from the server, toggles the isImportant
     * property, add important category id to categoryIds list if isImportant is false
     * or remove category id from categoryIds list if isImportnat is true and update
     * the task in server when important icon clicked.
     */
    function setTaskImportant() {
        let id = this.id;

        getOrSaveDetails("/tasks/".concat(id.split('-')[1]), "GET").then((task) => {

            if (task.isImportant == true) {
                let categoryIndex = task.categoryIds.indexOf(2);
                task.categoryIds.splice(categoryIndex, categoryIndex);
                task.isImportant = false;
                if (task.isCompleted == true) {
                    temporaryCategory[1].count--;
                }
            } else {
                task.categoryIds.push(2);
                task.isImportant = true;
                if (task.isCompleted == true) {
                    temporaryCategory[1].count++;
                }
            }

            getOrSaveDetails("/category", "POST", temporaryCategory[1]).then(() => {
                if (selectedTask != undefined && selectedTask.id == id.split('-')[1]) {
                    renderRightContainer(task);
                }
                getOrSaveDetails("/task", "POST", task).then(() => buildCategory());
            });
        });
    }

    /**
     * This function takes the id of the task that was clicked, makes a call to the server 
     * to get the task details, and then display's the task details in the right container.
     */
    function selectTask() {
        let id = this.id;

        getOrSaveDetails("/tasks/".concat(id), "GET").then((task) => {

            rightContainer.className = "display-right-container";
            middleContainer.className = (mainBackgroundIcon.className == "hide")
                ? "middle-and-right" : "middle-with-left-and-right";
            let currentTask = document.getElementById('task-'.concat(task.id));

            if (selectedTask != undefined) {
                let oldTask = document.getElementById('task-'.concat(selectedTask.id));
                oldTask.className = "task-hover"
            }
            currentTask.className = "task-selected"
            renderRightContainer(task);
        });
    }

    /**
     * This function render right container task name, note and task status
     * from given task object.
     * 
     * @param task Contains task details such as id, name and note need to be rendered.
     */
    function renderRightContainer(task) {
        var rightTaskCompleted = createElement("div", { id: "completed-".concat(task.id), className: "completed" });
        var rightTaskName = createElement("div", { id: "right-task-name", className: "right-task-name" });
        var rightTaskImportant = createElement("div", { id: "important-".concat(task.id), className: "important" });

        if (task.isCompleted == true) {
            rightTaskName.classList.add('strike-name')
            rightTaskCompleted.appendChild(createElement('i', { id: "", className: "fa fa-check-circle" }));
        } else {
            rightTaskName.classList.remove('strike-name');
            rightTaskCompleted.appendChild(createElement('i', { id: "", className: "fa fa-circle-o" }));
        }

        if (task.isImportant == true) {
            rightTaskImportant.appendChild(createElement('i', { id: "", className: "fa fa-star" }));
        } else {
            rightTaskImportant.appendChild(createElement('i', { id: "", className: "fa fa-star-o" }));
        }
        rightTask.innerHTML = "";
        rightTaskImportant.addEventListener('click', setTaskImportant);
        rightTaskCompleted.addEventListener('click', setTaskCompleted);
        rightTaskName.innerHTML = task.name;
        rightTask.appendChild(rightTaskCompleted);
        rightTask.appendChild(rightTaskName);
        rightTask.appendChild(rightTaskImportant);
        addNoteDiv.innerHTML = task.note;
        selectedTask = task;
    }

    /**
     * This function hides the left container when side navigaiton button
     *  is clicked and changes the class name of middel container.
     */
    function hideSideBar() {
        leftContainer.classList.add("hide");

        middleContainer.className = (rightContainer.className == "hide")
            ? "middle-without-left" : "middle-and-right";

        mainBackgroundIcon.classList.remove("icon");
        mainBackgroundIcon.className = "hide";
        displaySideBarButton.classList.add("show");
    }

    /**
     * This function display left container an change the class name of middle container
     * based on the class name of right container.
     */
    function displaySideBar() {
        leftContainer.classList.remove("hide");

        middleContainer.className = (rightContainer.className == "hide")
            ? "middle-container" : "middle-with-left-and-right";

        mainBackgroundIcon.className = "icon";
        displaySideBarButton.classList.remove("show");
    }


    /**
     * This function gets value from categoryInput when enter key is pressed  store it in database 
     */
    function addCategory() {

        if (event.key == 'Enter' && categoryInput.value != "") {
            let newCategory = { id: 0, iconClass: 'fa fa-tasks', name: categoryInput.value, count: 0 };

            getOrSaveDetails("/category", "POST", newCategory).then((value) => {
                categoryInput.value = "";
                selectedCategoryId = value;
                buildCategory();
            });
        }
    }

    init();
}()); 