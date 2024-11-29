import { getTags } from '../../utils/tag.js';

import { formatDateTime } from '../../utils/utils.js';
import { getTruncateDescription } from '../../utils/utils.js'
import { requestGetAddress } from '../address/address.js';


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

    catch (error) { alert(`Error: ${error.message || "Unknown error"}`); }
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

export async function updatePagination(currentPageData) {
    const currentPage = currentPageData.pagination.current;
    const countPages = currentPageData.pagination.count;

    const buttonPrevPage = document.getElementById('button-prev-page-posts');
    const buttonNextPage = document.getElementById('button-next-page-posts');
    const firstButtonPage = document.getElementById('first-button-page');
    const secondButtonPage = document.getElementById('second-button-page');
    const thirdButtonPage = document.getElementById('third-button-page');

    const pages = [
        (currentPageData.pagination.current - 1) > 0 ? currentPageData.pagination.current - 1 :
            currentPageData.pagination.count,
        currentPage,
        (currentPageData.pagination.current + 1) <= currentPageData.pagination.count ?
            currentPageData.pagination.current + 1 : 1,
    ];

    firstButtonPage.textContent = pages[0];
    secondButtonPage.textContent = pages[1];
    thirdButtonPage.textContent = pages[2];

    firstButtonPage.style.visibility = countPages > 1 ? 'visible' : 'hidden';
    secondButtonPage.style.visibility = 'visible';
    thirdButtonPage.style.visibility = countPages > 2 ? 'visible' : 'hidden';

    [firstButtonPage, secondButtonPage, thirdButtonPage].forEach((button) => {
        button.style.backgroundColor = '';
        button.style.color = '';
    });

    if (currentPage === pages[0]) {
        firstButtonPage.style.backgroundColor = '#0b6ffd';
        firstButtonPage.style.color = 'white';
    }
    else if (currentPage === pages[1]) {
        secondButtonPage.style.backgroundColor = '#0b6ffd';
        secondButtonPage.style.color = 'white';
    }
    else if (currentPage === pages[2]) {
        thirdButtonPage.style.backgroundColor = '#0b6ffd';
        thirdButtonPage.style.color = 'white';
    }

    buttonPrevPage.style.visibility = countPages > 1 ? 'visible' : 'hidden';
    buttonNextPage.style.visibility = countPages > 1 ? 'visible' : 'hidden';
}

export async function showPosts(currentPageData) {
    const container = document.getElementsByClassName('container-posts')[0];
    container.innerHTML = '';

    const posts = currentPageData.posts;

    posts.forEach(async post => {
        container.appendChild(await getConcretePostHtml(post));
    });
}

export async function getConcretePostHtml(post, concretePage = false) {
    const postDiv = document.createElement('div');
    postDiv.classList.add('post');

    const headerPost = document.createElement('div');
    headerPost.classList.add('header-post');

    const postAuthorDateContainer = document.createElement('div');
    postAuthorDateContainer.classList.add('container-author-date');

    const postTextAboutAuthor = document.createElement('p');
    postTextAboutAuthor.classList.add('post-text-about-author');
    postTextAboutAuthor.textContent = post.author + ' - ';

    const postDate = document.createElement('div');
    postDate.classList.add('post-data');
    postDate.textContent = formatDateTime(post.createTime);

    const postCommunity = document.createElement('p');
    postCommunity.classList.add('post-data');
    const communityName = post.communityName ? post.communityName : '415';
    postCommunity.textContent = ' в сообществе "' + communityName + '"';

    postAuthorDateContainer.appendChild(postTextAboutAuthor);
    postAuthorDateContainer.appendChild(postDate);
    postAuthorDateContainer.appendChild(postCommunity);

    const postName = document.createElement('a');
    postName.setAttribute('href', '#');
    postName.classList.add('post-name');
    postName.id = 'button-concrete-post';
    postName.setAttribute('data-post-id', post.id);
    postName.setAttribute('data-page', 'concrete');
    postName.textContent = post.title;

    headerPost.appendChild(postAuthorDateContainer);
    headerPost.appendChild(postName)

    const mainPost = document.createElement('div');
    mainPost.classList.add('main-post');

    if (post.image) {
        const postImg = document.createElement('img');
        postImg.classList.add('post-img');
        postImg.src = post.image;
        postImg.alt = post.title;
        mainPost.appendChild(postImg);
    }

    const postDesc = document.createElement('div');
    postDesc.classList.add('post-desc');

    const description = post.description;
    const maxLength = 500;

    const truncatedDescription = getTruncateDescription(description, maxLength);
    postDesc.textContent = truncatedDescription;

    if (truncatedDescription !== description) {
        const buttonReadFull = document.createElement('a');
        buttonReadFull.id = 'button-read-full';
        buttonReadFull.textContent = 'Читать полностью';
        buttonReadFull.setAttribute('data-post-id', post.id);
        postDesc.appendChild(buttonReadFull);
    }

    const postTags = document.createElement('div');
    postTags.classList.add('post-tags');
    const tags = post.tags;
    if (tags.length >= 1) {
        tags.forEach(tag => {
            const tagHtml = document.createElement('p');
            tagHtml.classList.add('tag');
            tagHtml.textContent = '#' + tag.name;
            postTags.appendChild(tagHtml);
        });
    }

    const postReadTime = document.createElement('p');
    postReadTime.classList.add('post-read-time');
    postReadTime.textContent = 'Время чтения: ' + post.readingTime + ' мин.';

    mainPost.appendChild(postDesc);
    mainPost.appendChild(postTags);
    mainPost.appendChild(postReadTime);

    if (post.addressId !== null && concretePage) {
        const addressHtml = document.createElement('div');
        addressHtml.classList.add('address');

        const addressText = document.createElement('p');
        addressText.id = 'text-address';

        const addressIcon = document.createElement('img');
        addressIcon.src = '/src/drawable/icon-address.png';
        addressIcon.classList.add('icon');
        addressIcon.id = 'icon-address';

        addressHtml.appendChild(addressIcon);

        const fullAddress = await requestGetAddress(post.addressId);
            console.log(fullAddress);
            fullAddress.forEach(address => {
                addressText.textContent = addressText.textContent + address.text + ',  ';
            });

        addressHtml.appendChild(addressText);
        mainPost.appendChild(addressHtml);
    }

    const footerPost = document.createElement('div');
    footerPost.classList.add('footer-post');

    const containerComment = document.createElement('div');
    containerComment.classList.add('container-comment');
    const containerLike = document.createElement('div');
    containerLike.classList.add('container-like');

    const amountComments = document.createElement('p');
    amountComments.classList.add('amount-comments');
    amountComments.textContent = post.commentsCount;

    const commentIcon = document.createElement('img');
    commentIcon.src = '/src/drawable/icon-comment.png';
    commentIcon.classList.add('icon');
    commentIcon.setAttribute('data-post-id', post.id);
    commentIcon.setAttribute('data-page', 'concrete');
    commentIcon.id = 'button-icon-comment';

    const amountLikes = document.createElement('p');
    amountLikes.classList.add('amount-likes');
    amountLikes.textContent = post.likes || 0;


    const likeIcon = document.createElement('img');
    if (post.hasLike) {
        likeIcon.src = '/src/drawable/icon-heart-full.png';
    }
    else {
        likeIcon.src = '/src/drawable/icon-heart-empty.png';
    }

    likeIcon.classList.add('icon');
    likeIcon.setAttribute('data-post-id', post.id);
    likeIcon.id = 'button-icon-heart';

    containerComment.appendChild(amountComments);
    containerComment.appendChild(commentIcon);

    containerLike.appendChild(amountLikes);
    containerLike.appendChild(likeIcon);

    footerPost.appendChild(containerComment);
    footerPost.appendChild(containerLike);

    postDiv.appendChild(headerPost);
    postDiv.appendChild(mainPost);
    postDiv.appendChild(footerPost);

    return postDiv;
}