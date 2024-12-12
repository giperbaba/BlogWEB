import { handleError } from "../../../utils/utils.js";

export async function getCommunityList() {
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/community`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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
    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
}

export async function getCommunity(id) { //information about community
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/community/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
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
    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }


}

export async function getRoleInCommunity(id) { //get the greatest role in community or null
    try {
        const currentToken = localStorage.getItem('token');

        const response = await fetch(`https://blog.kreosoft.space/api/community/${id}/role`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            return data;
        }

        else {
            if (response.status === 400) {
                const errorData = await response.json();
                const errorElement = document.getElementById("error");
                errorElement.textContent = errorData.message;
            }
            handleError(response);
        }
    }
    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
}

export async function requestSubscribe(id) {
    try {
        const currentToken = localStorage.getItem('token');
        const response = await fetch(`https://blog.kreosoft.space/api/community/${id}/subscribe`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
            }
        });

        if (response.ok) {
            return await response;
        }
        else {
            handleError(response);
        }
    }
    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
}

export async function requestUnsubscribe(id) {
    try {
        const currentToken = localStorage.getItem('token');
        const response = await fetch(`https://blog.kreosoft.space/api/community/${id}/unsubscribe`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
            }
        });

        if (response.ok) {
            return await response;
        }
        else {
            handleError(response);
        }
    }
    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
}

export async function requestGetCommunityPosts(id, page) { //get community posts
    console.log(id);
    const currentToken = localStorage.getItem('token') || null;
    let searchParams = await getFiltersForGetPosts(page);

    updateUrlParams(searchParams);

    searchParams = new URLSearchParams(window.location.search);

    const currentPage = 'communities';
    history.pushState({ currentPage }, '', window.location.href);

    if (!searchParams) { return; }

    try {
        const headers = {};
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(`https://blog.kreosoft.space/api/community/${id}/post?${searchParams}`, {
            method: 'GET',
            headers: headers,
        })

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        }
        if (!response.ok) {
            if (response.status == 403) {
                alert('You must be a subscriber to this group to view posts');
            }
            else {
                handleError(response);
            }
        }
    }
    catch (error) {
        console.error('Fetch error:', error);
    }
}

export async function getFiltersForGetPosts(currentPage) {
    const formData = new FormData(document.querySelector('#form-filters'));

    const tags = formData.getAll('search-tag');
    const sorting = formData.get('sort-by') || 'CreateDesc';
    const page = currentPage;
    const size = document.getElementById('posts-count').value || 1;

    const searchParams = new URLSearchParams();

    if (tags.length > 0) {
        tags.forEach(tag => searchParams.append('tags', tag));
    }

    if (sorting) {
        searchParams.append('sorting', sorting);
    }

    searchParams.append('page', page);
    searchParams.append('size', size);

    return searchParams;
}

function updateUrlParams(params) {
    const url = new URL(window.location.href) + params;
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
}

//create post in community
export async function createCommunityPost(id, data) {
    const currentToken = localStorage.getItem('token');
    const response = await fetch(`https://blog.kreosoft.space/api/community/${id}/post`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${currentToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const data = await response.json();
        alert('Пост отправлен');
        return data;
    }
    else {
        if (response.status === 400) {
            const errorData = await response.json();
            const errorElement = document.getElementById("error");

            const errorDataList = errorData.errors;
            let errorMessages = '';

            Object.entries(errorDataList).forEach(([key, messages]) => {
                messages.forEach(message => {
                    errorMessages += `${message}\n`;
                });
            });

            errorElement.textContent = errorMessages;
            return;
        }
        if (response.status === 403) {
            alert('You must be administrator of this group to write post in concrete community');
            return;
        }
        handleError(response);
    }
}