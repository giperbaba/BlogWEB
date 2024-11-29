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

export async function requestAddComment(postId, data) {
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
            if (response.status === 400) {
                const errorData = await response.json();
                const errorElement = document.getElementById("error");
                console.log(errorData.title);

                if (errorData.title) {
                    errorElement.textContent = errorData.title;
                }
            }
            handleError(response);
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function requestEditComment(id, content) { //{ "content": "string" }
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({content}),
        })

        if (response.ok) {
            return true;
        }
        else {
            if (response.status === 400) {
                const errorData = await response.json();
                const errorElement = document.getElementById("error");
                console.log(errorData.title);

                if (errorData.title) {
                    errorElement.textContent = errorData.title;
                }
            }
        }
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function requestDeleteComment(id) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/comment/${id}`, {
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