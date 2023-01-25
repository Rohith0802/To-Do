import { getDetails, saveOrUpdateDetails } from "./fetchapi.js";

const defaultUrl = "http://localhost:8080/todo";

export function getCategories() {
    return getDetails(`${defaultUrl}/categories`);
}

export function getTaskById(id) {
    return getDetails(`${defaultUrl}/tasks/${id}`);
}

export function saveOrUpdateTask(task) {
    return saveOrUpdateDetails(`${defaultUrl}/task`, task);
}

export function saveOrupdateCategory(category) {
    return saveOrUpdateDetails(`${defaultUrl}/category`, category);
}

export function saveOrupdateCategories(categories) {
    return saveOrUpdateDetails(`${defaultUrl}/categories`, categories);
}

export function getAllTasks() {
    return getDetails(`${defaultUrl}/tasks`);
}