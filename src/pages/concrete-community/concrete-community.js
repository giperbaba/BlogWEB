import { updatePagination } from '../main/main.js';
import { formatDateTime } from '../../utils/utils.js';
import { getTruncateDescription } from '../../utils/utils.js'
import { requestGetAddress } from '../address/address.js';
import { getCommunity } from '../communities/community/community.js';
import { getRoleInCommunity } from '../communities/community/community.js';
import { requestSubscribe } from '../communities/community/community.js';
import { requestUnsubscribe } from '../communities/community/community.js';

export function generatePostOptions() {
    const postsCountSelect = document.getElementById('posts-count');
    for (let i = 5; i <= 200; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        postsCountSelect.appendChild(option);
    }
}

export async function showPosts(currentPageData) {
    const container = document.getElementsByClassName('container-posts')[0];
    container.innerHTML = '';

    const posts = currentPageData.posts;

    posts.forEach(async post => {
        container.appendChild(await getConcretePostHtml(post));
    });
    window.scrollTo({
        top: 100,
        behavior: "smooth",
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
    postName.setAttribute('data-community-id', post.communityId);
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

    const textDesc = document.createElement('p');
    textDesc.id = 'text-desc';

    const truncatedDescription = getTruncateDescription(description, maxLength);
    textDesc.textContent = truncatedDescription;

    postDesc.appendChild(textDesc);

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

        console.log(addressText.textContent);
        console.log(addressText.textContent.trim())
        addressText.textContent = addressText.textContent.trim().slice(0, -1);


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
    likeIcon.setAttribute('data-community-id', post.communityId);
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

export async function showInfoAboutCommunity(id) {
    const community = await getCommunity(id);

    const name = document.getElementById('text-group-name');
    const amountSubscribers = document.getElementById('text-amount-subscribers');
    const typeCommunity = document.getElementById('text-type-community');
    const buttonSubscribe = document.getElementById('subscription');
    buttonSubscribe.id = id;

    name.textContent = `Группа "${community.name}"`;
    amountSubscribers.textContent = `${community.subscribersCount} подписчиков`;

    const textTypeCommunity = community.isClosed ? 'закрытое' : 'открытое';
    typeCommunity.textContent = `Тип сообщества: ${textTypeCommunity}`;

    const currentToken = localStorage.getItem('token');
    let role = 'Unauthorized';
    if (currentToken) {
        role = await getRoleInCommunity(id);
    }

    switch (role) {
        case 'Subscriber':
        case null:
        case 'Administrator':
            if (role == 'Subscriber' || role == 'Administrator') {
                buttonSubscribe.innerHTML = 'Отписаться';
                buttonSubscribe.style.background = '#dc3545';
            }
            else {
                buttonSubscribe.innerHTML = 'Подписаться';
            }

            buttonSubscribe.addEventListener('click', async function (e) {
                if (buttonSubscribe.style.background === '#dc3545' || buttonSubscribe.style.background == 'rgb(220, 53, 69)') {
                    await requestUnsubscribe(buttonSubscribe.id);
                    buttonSubscribe.style.background = '#0b6ffd';
                    buttonSubscribe.innerHTML = 'Подписаться';
                }
                else {
                    await requestSubscribe(buttonSubscribe.id);
                    buttonSubscribe.style.background = '#dc3545';
                    buttonSubscribe.innerHTML = 'Отписаться';
                }
            });
            break;


        case 'Unauthorized':
            buttonSubscribe.addEventListener('click', async function (e) {
                alert('Please, authorize to subscribe');
            });
            break;

        default:
            break;
    }

    const buttonWritePost = document.getElementById('button-write-post');
    buttonWritePost.setAttribute('id-community', id);

    const buttonApplyFilters = document.getElementById('button-apply-filters');
    buttonApplyFilters.setAttribute('id-community', id);

    pushAdmins(community.administrators);
}

export function showConcreteCommunityPage(id) {
    showInfoAboutCommunity(id);
    changePaginationForConcreteCommunityPage(id, 'button-prev-page-posts');
    changePaginationForConcreteCommunityPage(id, 'button-next-page-posts');
    changePaginationForConcreteCommunityPage(id, 'first-button-page');
    changePaginationForConcreteCommunityPage(id, 'second-button-page');
    changePaginationForConcreteCommunityPage(id, 'third-button-page');
}

function pushAdmins(administrators) {
    const containerAdmins = document.getElementById('container-admins');
    administrators.forEach(async admin => {
        containerAdmins.appendChild(await getAuthorHtml(admin));
    });
}

async function getAuthorHtml(author) {
    const divAuthor = document.createElement('div');
    divAuthor.classList.add('author');

    divAuthor.addEventListener('click', async () => {
        await navigate('main');

        const waitForForm = () =>
            new Promise((resolve) => {
                const observer = new MutationObserver((mutationsList, observer) => {
                    const form = document.querySelector('#form-filters');
                    if (form) {
                        observer.disconnect();
                        resolve(form);
                    }
                });
                observer.observe(document.body, { childList: true, subtree: true });
            });

        const form = document.querySelector('#form-filters') || (await waitForForm());

        const input = form.querySelector('[name="input-search-by-name"]');
        if (input) {
            input.value = author.fullName;
        }
        const currentPageData = await getPosts(1);
        updatePagination(currentPageData);
        await showPosts(currentPageData);

    });

    const imgAuthor = document.createElement('img');
    imgAuthor.classList.add('icon-gender');
    if (author.gender === 'Female') {
        imgAuthor.src = '/src/drawable/icon-women.png';
        imgAuthor.id = 'icon-women';
    }
    else {
        imgAuthor.src = '/src/drawable/icon-men.png';
        imgAuthor.id = 'icon-man';
    }

    divAuthor.appendChild(imgAuthor);

    const name = document.createElement('p');
    name.classList.add('text-name');
    name.textContent = author.fullName;

    divAuthor.appendChild(name);
    return divAuthor;
}

function changePaginationForConcreteCommunityPage(id, buttonName) {
    const button = document.getElementById(buttonName);
    button.setAttribute('id-community', id);
}