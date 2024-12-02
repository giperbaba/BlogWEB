import { handleError } from "../../utils/utils.js";

export async function requestGetAddress(objectGuid) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/address/chain?objectGuid=${objectGuid}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

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

export async function requestSearchAddress(parentObjectId = 0, query = '') {
    try {
        const response = await fetch (`https://blog.kreosoft.space/api/address/search?parentObjectId=${parentObjectId}&query=${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log(data);
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