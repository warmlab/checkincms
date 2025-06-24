async function postJSON(url, data) {
    try {
        const response = await fetch(url, {
            method: "POST", // or "PUT"
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        return result;
    } catch (err) {
        console.error("Error: ", err);
    }

    return null;
}
