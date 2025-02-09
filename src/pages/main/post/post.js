export async function getFiltersForGetPosts(currentPage) {

    const formData = new FormData(document.querySelector('#form-filters'));

    const tags = formData.getAll('search-tag');
    const author = formData.get('input-search-by-name') || null;
    const min = formData.get('read-time-min') || null;
    const max = formData.get('read-time-max') || null;
    const sorting = formData.get('sort-by') || 'CreateDesc';
    const onlyMyCommunities = formData.get('are-only-my-communities') ? true : false;
    const page = currentPage;
    const size = document.getElementById('posts-count').value || 1;

    const searchParams = new URLSearchParams();

    if (tags.length > 0) {
        tags.forEach(tag => searchParams.append('tags', tag));
    }
    if (author) {
        searchParams.append('author', author);
    }
    if (min) {
        searchParams.append('min', min);
    }
    if (max) {
        searchParams.append('max', max);
    }
    if (sorting) {
        searchParams.append('sorting', sorting);
    }

    if (min && max && Number(min) > Number(max)) {
        const error = document.getElementById('error');
        if (error) {
            error.textContent = "Некорректные значения времени чтения";
        }
        return null;
    }

    searchParams.append('onlyMyCommunities', onlyMyCommunities);

    searchParams.append('page', page);
    searchParams.append('size', size);

    return searchParams;
}

export async function getPosts(page = 1) {
    const currentToken = localStorage.getItem('token') || null;
    let searchParams = await getFiltersForGetPosts(page);

    updateUrlParams(searchParams);

    searchParams = new URLSearchParams(window.location.search);

    const currentPage = 'main';
    history.pushState({ currentPage }, '', window.location.href);

    if (!searchParams) { return; }

    try {
        const headers = {};
        if (currentToken) {
            headers['Authorization'] = `Bearer ${currentToken}`;
        }

        const response = await fetch(`https://blog.kreosoft.space/api/post?${searchParams}`, {
            method: 'GET',
            headers: headers,
        })

        if (response.ok) {
            const data = await response.json();
            return data;
        }
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`${response.status} - ${errorText}`);
            throw new Error(errorText || 'Unknown server error');
        }
    }
    catch (error) {
        console.error('Fetch error:', error);
    }
}

export async function getInformationConcretePost(id) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${id}`, {
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
        else if (response.status === 400) {
            const errorText = await response.text();
            alert(errorText);
        }
        else if (response.status === 401) {
            alert('Please, authorize');
        }

    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function addLike(postId) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            return true;
        }
        else if (response.status === 400) {
            const errorText = await response.text();
            alert(errorText);
        }
        else if (response.status === 401) {
            alert('Please, authorize');
        }

        return false;
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

export async function deleteLike(postId) {
    const currentToken = localStorage.getItem('token');
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post/${postId}/like`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`
            }
        });

        if (response.ok) {
            return true;
        }

        else if (response.status === 401) {
            alert('Please, authorize');
        }

        else if (response.status === 400) {
            const errorText = await response.text();
            alert(errorText);
        }
        return false;
    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}

function updateUrlParams(params) {
    const url = new URL(window.location.href) + params;
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
}