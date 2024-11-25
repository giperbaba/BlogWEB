import { getTags } from '../../utils/tag.js'; 

export async function pushTags() {
    try {
        const tags = await getTags(); 
        const select = document.getElementById('select-search-tag'); 

        select.innerHTML = '';

        if (tags && Array.isArray(tags)) {
            tags.forEach(tag => {
                const option = document.createElement('option');
                option.value = tag.id; 
                option.textContent = tag.name;
                select.appendChild(option);
            });
        } 
    } 

    catch(error) { alert(`Error: ${error.message || "Unknown error"}`); } 
}

export function generatePostOptions() {
    const postsCountSelect = document.getElementById('posts-count');
    for (let i = 1; i <= 1000; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        postsCountSelect.appendChild(option);
    }
}

