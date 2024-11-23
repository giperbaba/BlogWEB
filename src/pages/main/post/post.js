async function getFiltersForGetPosts() {
    const formData = new FormData(document.querySelector('#form-filters'));

    const tags = formData.get('select-search-tag')|| [];
    const author = formData.get('input-search-by-name') || '';
    const min = formData.get('read-time-min') || '';
    const max = formData.get('read-time-max')|| '';
    const sorting = formData.get('select-sort-by') || 'CreateDesc';
    const onlyMyCommunities = formData.get('are-only-my-communities') || false;
    const page = 1;
    const size = 5;

    const searchParams = new URLSearchParams ({
        tags,
        author,
        min,
        max,
        sorting,
        onlyMyCommunities,
        page,
        size
    })

    return searchParams;
}

export async function getPosts() {
    const searchParams = getFiltersForGetPosts();
    try {
        const response = await fetch(`https://blog.kreosoft.space/api/post?${searchParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        })

        if (response.ok) {
            const data = await response.json();
            console.log(data);
            return data;
        }

    }
    catch (error) {
        alert(`Error: ${error.message || "Unknown error"}`);
    }
}


