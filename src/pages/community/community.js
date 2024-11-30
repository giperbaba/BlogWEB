import { handleError } from "../../utils/utils.js";

export async function getCommunity(id) {
    const response = await fetch(`https://blog.kreosoft.space/api/community/${id}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    if (response.ok) {
        const data = await response;
        return data;
    }

    else {
        handleError(response);
    }
}

export async function getRoleInCommunity(id) { //id community
    const currentToken = localStorage.getItem('token');

    const response = await fetch(`https://blog.kreosoft.space/api/community/${id}/role`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (response.ok) {
        const data = await response;
        return data;
    }

    else {
        handleError(response);
    }
}