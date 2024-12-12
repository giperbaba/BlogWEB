import { login } from '../authorization/auth.js'
import { register } from '../registration/register.js'
import { edit, logout, getResponseProfile, showProfile } from '../profile/profile.js'
import { pushTags, generatePostOptions, showPosts, updatePagination } from '../main/main.js'
import { getPosts, addLike, deleteLike } from '../main/post/post.js'
import { deleteComment, editComment, uploadConcretePostPage, sendComment, openReplies, showInputAnswer, showInputEditComment } from '../concrete-post/concrete-post.js'
import { pushGroups, createPost, createSearchAddressFields } from '../write-post/write-post.js'
import { showCommunities } from '../communities/communities.js'
import { showAuthors } from '../authors/authors.js'
import { showConcreteCommunityPage } from '../concrete-community/concrete-community.js'
import { getRoleInCommunity, requestGetCommunityPosts } from '../communities/community/community.js'

export function navigate(page, postId = null, communityId = null, options = {}) {
    const pages = {
        login: '/src/pages/authorization/authorization.html',
        registration: '/src/pages/registration/registration.html',
        profile: '/src/pages/profile/profile.html',
        main: '/src/pages/main/main.html',
        writePost: '/src/pages/write-post/write-post.html',
        concrete: '/src/pages/concrete-post/concrete-post.html',
        communities: '/src/pages/communities/communities.html',
        authors: '/src/pages/authors/authors.html',
        community: '/src/pages/concrete-community/concrete-community.html'
    };
    const url = pages[page];

    if (!url) {
        console.error('Page not found');
        return;
    }

    const protectedPages = ['profile', 'writePost'];
    const token = localStorage.getItem('token');

    if (protectedPages.includes(page) && !token) {
        alert('Session timed out');
        return navigate('login');
    }

    const newPath = buildPathForPage(page, postId, communityId, options);
    history.pushState({ page }, '', newPath);

    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('Page not found');
            return response.text();
        })
        .then(async html => {
            document.getElementById('main').innerHTML = html;

            if (page === 'login') {
                localStorage.removeItem('token');
                editHeaderButtons(page);
            }

            else if (page === 'profile') {
                getResponseProfile(token)
                    .then(profile => {
                        showProfile(profile);
                        editHeaderButtons(page, profile);
                    })
                    .catch(console.error);
            } 
            else if (page === 'login' || page === 'registration') {
                editHeaderButtons(page);
            } 
            else if (page === 'main') {
                editHeaderButtons(page);
                generatePostOptions();
                pushTags();
            } 
            else if (page === 'writePost') {
                pushGroups();
                pushTags();
                createSearchAddressFields();
            } 
            else if (page === 'concrete') {
                if (postId) {
                    await uploadConcretePostPage(postId);
                }
            }
            else if (page === 'communities') {
                await showCommunities();
            }

            else if (page === 'authors') {
                await showAuthors();
            }

            else if (page === 'community') {
                showConcreteCommunityPage(communityId);
                generatePostOptions();
                pushTags();
            }
        })
        .catch(console.error);
}

function buildPathForPage(page, postId = null, communityId = null, options = {}) {
    switch (page) {
        case 'login':
        case 'registration':
        case 'profile':
        case 'communities':
        case 'authors':
            return `/${page}`;
        case 'writePost':
            return 'create/post';
        case 'concrete':
            return `/post/${postId}}`;
        case 'community':
            return `/communities/${communityId}`;
        case 'main':
        default: {
            const params = new URLSearchParams(options).toString();
            return `/${params ? `?${params}` : ''}`;
        }
    }
}

window.addEventListener('popstate', (event) => {
    if (event.state) {
        navigate(event.state.page);
    }
});


document.querySelectorAll('.nav-text').forEach(item => {
    item.addEventListener('click', function (event) {
        event.preventDefault();
        const page = item.getAttribute('data-page');
        navigate(page);
    });
});

let currentPageData = null;
let postId = null;
let fullPost = null;

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
                event.preventDefault();
                await edit();
            }
            else {
                formEdit?.reportValidity();
            }
            break;

        case 'button-apply-filters':
            if (target.getAttribute('id-community')) {
                currentPageData = await requestGetCommunityPosts(target.getAttribute('id-community'), 1);
            }
            else {
                currentPageData = await getPosts(1);
            }
            updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'button-prev-page-posts':
            const prevPage = (currentPageData.pagination.current - 1) > 0 ? currentPageData.pagination.current - 1 : currentPageData.pagination.count;

            if (target.getAttribute('id-community')) {
                currentPageData = await requestGetCommunityPosts(target.getAttribute('id-community'), prevPage);
            }
            else {
                currentPageData = await getPosts(prevPage);
            }
            await updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'button-next-page-posts':
            const nextPage = (currentPageData.pagination.current + 1) <= currentPageData.pagination.count ? currentPageData.pagination.current + 1 : 1;
            if (target.getAttribute('id-community')) {
                currentPageData = await requestGetCommunityPosts(target.getAttribute('id-community'), nextPage);
            }
            else {
                currentPageData = await getPosts(nextPage);
            }
            await updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'first-button-page':
        case 'second-button-page':
        case 'third-button-page':
            const pageChange = parseInt(target.textContent, 10);
            if (target.getAttribute('id-community')) {
                currentPageData = await requestGetCommunityPosts(target.getAttribute('id-community'), pageChange);
            }
            else {
                currentPageData = await getPosts(pageChange);
            }
            await updatePagination(currentPageData);
            await showPosts(currentPageData);
            break;

        case 'button-read-full':
            postId = target.getAttribute('data-post-id');

            fullPost = null;
            const allPosts = currentPageData.posts;
            allPosts.forEach(post => {
                if (post.id === postId) {
                    fullPost = post;
                }
            });

            if (fullPost) {
                const postDescElement = target.parentElement;
                postDescElement.textContent = fullPost.description;
            }
            break;

        case 'button-icon-heart':
            postId = target.getAttribute('data-post-id');

            const isLiked = target.getAttribute('src') === '/src/drawable/icon-heart-empty.png';
                const action = isLiked ? addLike : deleteLike;

                if (await action(postId)) {
                    target.src = isLiked
                        ? '/src/drawable/icon-heart-full.png'
                        : '/src/drawable/icon-heart-empty.png';

                    const amountLikesElement = target.parentNode.querySelector('.amount-likes');
                    const currentLikes = parseInt(amountLikesElement.textContent) || 0;
                    amountLikesElement.textContent = isLiked
                        ? currentLikes + 1
                        : Math.max(currentLikes - 1, 0);
                }

            break;

        case 'button-icon-comment':
            navigate(target.getAttribute('data-page'), target.getAttribute('data-post-id'), 'container-comments');
            break;

        case 'button-concrete-post':
            postId = target.getAttribute('data-post-id');
            navigate(target.getAttribute('data-page'), target.getAttribute('data-post-id'));
            break;

        case 'button-send-comment':
            const inputElement = document.getElementById('input-create-comment');
            const commentContent = inputElement.value.trim();
            if (await sendComment(target.getAttribute('data-post-id'), commentContent)) { }
            break;

        case 'button-open-answer':
            await openReplies(target.getAttribute('data-comment-id'));
            break;

        case 'button-answer':
            showInputAnswer(target.getAttribute('data-comment-id'));
            break;

        case 'button-send-answer':
            const inputAnswer = document.getElementById('input-answer');
            const answerContent = inputAnswer.value.trim();
            await sendComment(target.getAttribute('data-post-id'), answerContent, target.getAttribute('parent-id'));
            break;

        case 'button-edit-comment':
            showInputEditComment(target.getAttribute('data-comment-id'));
            break;

        case 'button-send-edit':
            const inputEdit = document.getElementById('input-edit');
            const editContent = inputEdit.value.trim();
            await editComment(target.getAttribute('data-comment-id'), editContent, target.getAttribute('data-post-id'));
            break;

        case 'button-delete-comment':
            deleteComment(target.getAttribute('data-comment-id'), target.getAttribute('data-post-id'));
            break;

        case 'button-write-post':
            const token = localStorage.getItem('token');
            if (token) {
                const profile = await getResponseProfile(token);
                if (profile !== null) {
                    if (target.getAttribute('id-community')) {
                        const role = await getRoleInCommunity(target.getAttribute('id-community'));

                        if (role == 'Administrator') {
                            navigate(page);
                        }
                        else {
                            alert('You must be administrator of this group to write post in concrete community');
                        }
                    }
                    else {
                        navigate(page);
                    }                   
                    break;
                }
            }
            else {
                alert('Please, authorize to write post');
            }
            break;

        case 'button-write-post-header':
            navigate(page);
            break;

        case 'button-create-post':
            const formCreatePost = document.querySelector('.form-write-new-post');
            if (formCreatePost && formCreatePost.checkValidity()) {
                event.preventDefault();
                await createPost();         
            }
            else {
                formCreatePost?.reportValidity();
            }
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
    const buttonWritePost = document.getElementById("button-write-post-header");
    const menuDropdown = document.getElementById("dropdown-menu");
    const menuUserMailText = document.getElementById("nav-mail");

    const buttonAuthors = document.getElementById("button-authors");
    const buttonGroups = document.getElementById("button-groups");

    buttonEnter.style.display = "none";
    buttonWritePost.style.display = "inline";
    menuDropdown.style.display = "block";
    menuUserMailText.textContent = `${profile.email} ▼`;

    if (buttonAuthors) {
        buttonAuthors.style.display = "none";
        buttonGroups.style.display = "none";
    }

    menuDropdown.removeEventListener('click', openDropdownMenu);
    menuDropdown.addEventListener('click', openDropdownMenu);

    setupLogoutHandler();
    setupProfileHandler();
}

function editHeaderAuthPage() {
    const buttonEnter = document.getElementById("nav-enter");
    const menuDropdown = document.getElementById("dropdown-menu");
    const buttonWritePost = document.getElementById("button-write-post-header");
    const buttonAuthors = document.getElementById("button-authors");
    const buttonGroups = document.getElementById("button-groups");

    buttonEnter.style.display = "inline";
    buttonWritePost.style.display = "none";
    menuDropdown.style.display = "none";
    buttonAuthors.style.display = "none";
    buttonGroups.style.display = "none";
}

function editHeaderMainPage() {
    const buttonWritePost = document.getElementById("button-write-post-header");
    const buttonAuthors = document.getElementById("button-authors");
    const buttonGroups = document.getElementById("button-groups");

    buttonWritePost.style.display = "none";
    buttonAuthors.style.display = "inline";
    buttonGroups.style.display = "inline";
}

function editHeaderButtons(page, profile = null) {
    if (page === 'login' || page === 'registration') {
        editHeaderAuthPage();
    }
    else if (page === 'profile') {
        editHeaderProfilePage(profile);
    }
    else if (page === 'main') {
        editHeaderMainPage();
    }
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
    navigate('login');
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

navigate('login');

