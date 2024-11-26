import { login } from '../authorization/auth.js'
import { register } from '../registration/register.js'

import { edit } from '../profile/profile.js'
import { logout } from '../profile/profile.js'
import { getResponseProfile } from '../profile/profile.js'
import { showProfile } from '../profile/profile.js'

import { pushTags } from '../main/main.js'
import { generatePostOptions } from '../main/main.js'

import { getPosts } from '../main/post/post.js'


export function navigate(page) {
    const pages = {
        authorization: '/src/pages/authorization/authorization.html',
        registration: '/src/pages/registration/registration.html',
        profile: '/src/pages/profile/profile.html',
        main: '/src/pages/main/main.html'
    };

    const url = pages[page];

    const protectedPages = ['profile'];
    const token = localStorage.getItem('token');

    if (protectedPages.includes(page) && !token) {
        alert('Время сеанса истекло');
        return navigate('authorization');
    }

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error("Page not found");
            return response.text();
        })
        .then(html => {
            document.getElementById('main').innerHTML = html;

            history.pushState({ page: page }, page, `#${page}`);

            if (page === 'profile') {
                const token = localStorage.getItem('token');
                if (token) {
                    getResponseProfile(token)
                        .then(profile => {
                            showProfile(profile);
                            editHeaderProfilePage(profile)
                        })
                        .catch(error => console.error(error));
                }
            }

            if (page === 'authorization') {
                editHeaderMailForButtonEnter();
            }

            if (page === 'main') {
                generatePostOptions();
                pushTags();
            }

        })
        .catch(error => {
            console.log(error);
        });
}

window.addEventListener('popstate', (event) => {
    if (event.state) {
        navigate(event.state.page);
    }
});

if (window.location.hash) {
    const page = window.location.hash.slice(1);
    navigate(page);
}

document.querySelectorAll('.nav-text').forEach(item => {
    item.addEventListener('click', function (event) {
        event.preventDefault();
        const page = item.getAttribute('data-page');
        navigate(page);
    });
});

let currentPageData = null;
document.getElementById('main').addEventListener('click', async function (event) {
    //event.preventDefault(); влияет на вход в аккаунт и на работоспособность checkbox

    const target = event.target;

    if (!target) return;

    const page = target.getAttribute('data-page');

    switch (target.id) {
        case 'button-page-register':
            navigate(page);
            break;

        case 'button-enter':
            const formAuth = document.querySelector('.form-auth');
            if (formAuth && formAuth.checkValidity()) {
                event.preventDefault();
                login(page);
            }
            else {
                formAuth?.reportValidity();
            }
            break;

        case 'button-register':
            const formRegister = document.querySelector('.form-register');
            if (formRegister && formRegister.checkValidity()) {
                event.preventDefault();
                register(page);
            }
            else {
                formRegister?.reportValidity();
            }
            break;

        case 'button-save-edit':
            const formEdit = document.querySelector('.form-profile');
            if (formEdit && formEdit.checkValidity()) {
                edit();
            }
            else {
                formEdit?.reportValidity();
            }
            break;

        case 'button-apply-filters':
            currentPageData = await getPosts(1);
            updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'button-prev-page-posts':
            const prevPage = (currentPageData.pagination.current - 1) > 0 ? currentPageData.pagination.current - 1 : currentPageData.pagination.count;
            currentPageData = await getPosts(prevPage);
            await updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'button-next-page-posts':
            const nextPage = (currentPageData.pagination.current + 1) <= currentPageData.pagination.count ? currentPageData.pagination.current + 1 : 1;
            currentPageData = await getPosts(nextPage);
            await updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'first-button-page':
        case 'second-button-page':
        case 'third-button-page':
            const pageChange = parseInt(target.textContent, 10);
            currentPageData = await getPosts(pageChange);
            await updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        default:
            break;
    }

    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', handlePhoneInput);
    }
});

function handlePhoneInput(e) {
    const input = e.target;
    let value = input.value.replace(/\D/g, '');

    if (value.startsWith('7') || value.startsWith('8')) {
        value = value.slice(1);
    }

    value = value.slice(0, 10);

    input.value = `+7 (${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 8)}-${value.slice(8, 10)}`;
}

function editHeaderProfilePage(profile) {
    const buttonEnter = document.getElementById("nav-enter");
    const menuDropdown = document.getElementById("dropdown-menu");
    const menuUserMailText = document.getElementById("nav-mail");
    const buttonWritePost = document.getElementById("button-write-post");

    buttonWritePost.style.display = "inline";
    buttonEnter.style.display = "none";
    menuDropdown.style.display = "block";
    menuUserMailText.textContent = `${profile.email} ▼`;

    menuDropdown.removeEventListener('click', openDropdownMenu);
    menuDropdown.addEventListener('click', openDropdownMenu);

    setupLogoutHandler();
    setupProfileHandler();
}

function editHeaderMailForButtonEnter() {
    const buttonEnter = document.getElementById("nav-enter");
    const menuDropdown = document.getElementById("dropdown-menu");
    const buttonWritePost = document.getElementById("button-write-post");

    buttonWritePost.style.display = "none";
    buttonEnter.style.display = "inline";
    menuDropdown.style.display = "none";
}

function openDropdownMenu(event) {
    event.preventDefault();
    const dropdownContent = document.getElementById("dropdown-content");
    dropdownContent.style.display = dropdownContent.style.display === 'none' ? 'flex' : 'none';
}

function handleProfile(event) {
    event.preventDefault();
    navigate('profile');
}

function handleLogout(event) {
    event.preventDefault();
    logout();
    navigate('authorization');
}

function setupProfileHandler() {
    const buttonDropdownProfile = document.getElementById("button-profile");

    buttonDropdownProfile.removeEventListener('click', handleProfile);
    buttonDropdownProfile.addEventListener('click', handleProfile);
}

function setupLogoutHandler() {
    const buttonDropdownLogout = document.getElementById("button-logout");

    buttonDropdownLogout.removeEventListener('click', handleLogout);
    buttonDropdownLogout.addEventListener('click', handleLogout);
}

async function updatePagination(currentPageData) {
    const currentPage = currentPageData.pagination.current;
    const countPages = currentPageData.pagination.count;

    const buttonPrevPage = document.getElementById('button-prev-page-posts');
    const buttonNextPage = document.getElementById('button-next-page-posts');
    const firstButtonPage = document.getElementById('first-button-page');
    const secondButtonPage = document.getElementById('second-button-page');
    const thirdButtonPage = document.getElementById('third-button-page');

    const pages = [
        (currentPageData.pagination.current - 1) > 0 ? currentPageData.pagination.current - 1 : currentPageData.pagination.count,
        currentPage,
        (currentPageData.pagination.current + 1) <= currentPageData.pagination.count ? currentPageData.pagination.current + 1 : 1,
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

async function showPosts(currentPageData) {
    const container = document.getElementsByClassName('container-posts')[0];
    container.innerHTML = '';

    const posts = currentPageData.posts;

    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');

        const headerPost = document.createElement('div');
        headerPost.classList.add('header-post');

        const postAuthorDateContainer = document.createElement('div');
        postAuthorDateContainer.classList.add('container-author-date');

        const postTextAboutAuthor = document.createElement('p');
        postTextAboutAuthor.classList.add('post-text-about-author');
        postTextAboutAuthor.textContent = post.author + ' - ';

        const postData = document.createElement('div');
        postData.classList.add('post-data');
        postData.textContent = formatDateTime(post.createTime);

        postAuthorDateContainer.appendChild(postTextAboutAuthor);
        postAuthorDateContainer.appendChild(postData);

        const postName = document.createElement('p');
        postName.classList.add('post-name');
        postName.textContent = post.title;

        headerPost.appendChild(postAuthorDateContainer);
        headerPost.appendChild(postName)

        const mainPost = document.createElement('div');
        mainPost.classList.add('main-post');

        if(post.image) {
            const postImg = document.createElement('img');
            postImg.classList.add('post-img');
            postImg.src = post.image;
            postImg.alt = post.title;
            mainPost.appendChild(postImg);
        }

        const postDesc = document.createElement('div');
        postDesc.classList.add('post-desc');
        postDesc.textContent = post.description;

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
        commentIcon.id = 'icon-comment';

        const amountLikes = document.createElement('p');
        amountLikes.classList.add('amount-likes');
        amountLikes.textContent = post.likes || 0;

        const likeIcon = document.createElement('img');
        likeIcon.src = '/src/drawable/icon-heart-empty.png';
        likeIcon.classList.add('icon');
        likeIcon.id = 'icon-heart';

        containerComment.appendChild(amountComments);
        containerComment.appendChild(commentIcon);

        containerLike.appendChild(amountLikes);
        containerLike.appendChild(likeIcon);

        footerPost.appendChild(containerComment);
        footerPost.appendChild(containerLike);

        postDiv.appendChild(headerPost);
        postDiv.appendChild(mainPost);
        postDiv.appendChild(footerPost);

        container.appendChild(postDiv);
    });
}

function formatDateTime(isoString) {
    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, '0'); 
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear(); // Год
    const hours = String(date.getHours()).padStart(2, '0'); 
    const minutes = String(date.getMinutes()).padStart(2, '0'); 

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}
