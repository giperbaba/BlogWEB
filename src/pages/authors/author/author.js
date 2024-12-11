import { handleError } from "../../../utils/utils.js";

export async function requestGetAuthors() {
    try {
        const response = await fetch('https://blog.kreosoft.space/api/author/list', {
            method: 'GET'
        })

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        else {
            handleError(response);
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}