import { getCommunityList } from "../community/community.js";

import { handleError } from "../../utils/utils.js";

async function sendRequestCreateUserPost (data) {
    const currentToken = localStorage.getItem('token');
    const response = await fetch ('https://blog.kreosoft.space/api/post', {
        method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
    });

    if (response.ok) {
        const data = await response.json();
        alert('Post was successfully created');
        return data;
    }
    else {
        if (response.status === 400) {
            const errorData = await response.json(); 
            console.log(errorData);
            const errorElement = document.getElementById("error");
        
            const errorDataList = errorData.errors; 
            let errorMessages = '';
        
            Object.entries(errorDataList).forEach(([key, messages]) => {
                messages.forEach(message => {
                    errorMessages += `${message}\n`;
                });
            });
        
            errorElement.textContent = errorMessages; 
        }
        handleError(response);
    }
}

export async function createPost() {
    const formData = new FormData(document.querySelector('.form-write-new-post'));

    const title = formData.get('post-name');
    const description = formData.get('post-text');
    const readingTime = formData.get('post-read-time');
    const image = formData.get('post-picture-link') || null;
    const tags = formData.getAll('select-search-tag'); 

    const addressId = null;

    const success = await sendRequestCreateUserPost({
        title,
        description,
        readingTime,
        image,
        addressId,
        tags
    });


}

export async function pushGroups() {
    try {
        const groups = await getCommunityList();
        const select = document.getElementById('post-group');

        select.innerHTML = '';

        const defaultOption = document.createElement('option');
                defaultOption.value = null;
                defaultOption.textContent = 'Без группы';
                select.appendChild(defaultOption);

        if (groups && Array.isArray(groups)) {
            groups.forEach(group => {
                const option = document.createElement('option');
                option.value = group.id;
                option.textContent = group.name;
                select.appendChild(option);
            });
        }
    }

    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
}