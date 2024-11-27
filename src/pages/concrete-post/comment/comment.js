import { handleError } from "../../../utils/utils.js";

export async function requestGetAllReplies(commentId) {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}/tree`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            return await response.json();
        }
        else {
            handleError(response);
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function requestAddComment(postId, data) { //{ "content": "и че теперь", "parentId": null }
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}/comment`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        });

        if (response.ok) {
            return true;
        }
        else {
            handleError(response);
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function requestEditComment(commentId, data) { //{ "content": "string" }
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })

        if (response.ok) {
            return true;
        }
        else {
            handleError(response);
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function requestDeleteComment(commentId) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        })

        if (response.ok) {
            return true;
        }
        else {
            handleError(await response);
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}