const defaultUrl = "http://localhost:8080/todo";

export async function getOrSaveDetails(url, type, data) {

    if (type == "GET") {
        const response = await fetch(defaultUrl.concat(url))
        return await response.json();
    }

    if (type == "POST") {
        var request = {headers: {'Content-type': 'application/json'},method: type, body: JSON.stringify(data)};
        const response = await fetch(defaultUrl.concat(url), request);
        return await response.json();
    }
}