export function getDetails(url) {

    return fetch(url).then((response) => {
        return response.json();
    });
}

export function saveOrUpdateDetails(url, object) {
    var request = {headers: {'Content-type': 'application/json'},method: "POST", body: JSON.stringify(object)};

    return fetch(url, request).then((response) => {
        var result;

        if (response.body != null) {
            result = response.json();
        }
        return result;
    });
}