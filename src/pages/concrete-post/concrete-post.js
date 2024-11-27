import { getConcretePostHtml } from '../main/main.js'
import { formatDateTime } from '../../utils/utils.js';

import { getInformationConcretePost } from '../main/post/post.js'
import { requestAddComment } from './comment/comment.js';
import { getResponseProfile } from '../profile/profile.js';

let post = null;
let postHtml = null;
let comments = null;

export async function uploadConcretePostPage(postId) {
    const postContainer = document.getElementById('container-post');
    const commentsContainer = document.getElementById('container-comments');

    post = await getInformationConcretePost(postId);
    postHtml = await getConcretePostHtml(post);

    postContainer.appendChild(postHtml);

    comments = post.comments;
    comments.forEach(comment => {
        commentsContainer.appendChild(getCommentHtml(comment));
    });


    const buttonSendComment = document.getElementById('button-send-comment');
    buttonSendComment.setAttribute('data-post-id', post.id);
}

function getCommentHtml(comment) {
    let commentHtml = document.createElement('div');
    commentHtml.classList.add('comment');

    const textAboutAuthor = document.createElement('p');
    textAboutAuthor.classList.add('post-text-about-author');
    textAboutAuthor.textContent = comment.author;

    const commentContentModifiedContainer = document.createElement('div');
    commentContentModifiedContainer.classList.add('container-content-modified');

    const commentContent = document.createElement('p');
    commentContent.classList.add('post-comment-content');
    commentContent.textContent = comment.content;

    commentContentModifiedContainer.appendChild(commentContent);

    if (comment.modifiedDate) {
        const isModified = document.createElement('a');
        isModified.classList.add('is-modified');
        isModified.textContent = '(изменен)';
        commentContentModifiedContainer.appendChild(isModified);

        isModified.addEventListener('mouseenter', () => {
            isModified.textContent = formatDateTime(comment.modifiedDate); 
        });

        isModified.addEventListener('mouseleave', () => {
            isModified.textContent = '(изменен)'; 
        });
    }

    const commentDateAnswerContainer = document.createElement('div');
    commentDateAnswerContainer.classList.add('container-date-answer');

    const postDate = document.createElement('div');
    postDate.classList.add('post-data');
    postDate.textContent = formatDateTime(comment.createTime);

    const buttonAnswer = document.createElement('a');
    buttonAnswer.classList.add('button-answer');
    buttonAnswer.id = 'button-answer';
    buttonAnswer.textContent = 'Ответить';
    buttonAnswer.setAttribute('data-post-id', post.id);
    buttonAnswer.setAttribute('data-comment-id', post.id);

    commentDateAnswerContainer.appendChild(postDate);
    commentDateAnswerContainer.appendChild(buttonAnswer);

    commentHtml.appendChild(textAboutAuthor);
    commentHtml.appendChild(commentContentModifiedContainer);
    commentHtml.appendChild(commentDateAnswerContainer);

    if (comment.subComments > 0) {
        const buttonOpenAnswers = document.createElement('a');
        buttonOpenAnswers.classList.add('button-answer');
        buttonOpenAnswers.id = 'button-open-answer';
        buttonOpenAnswers.textContent = 'Раскрыть ответы';
        buttonOpenAnswers.setAttribute('data-post-id', post.id);
        commentHtml.appendChild(buttonOpenAnswers);
    }
    return commentHtml;
}

export async function sendComment(postId, content, parentCommentId = null) {
    const currentToken = localStorage.getItem('token');

    const commentData = { content, parentCommentId };
    const success = await requestAddComment(postId, commentData);

    if (success) {
        const inputElement = document.getElementById('input-create-comment');
        if (inputElement) {
            inputElement.value = '';
        }

        const commentsContainer = document.getElementById('container-comments');
        
        const profile = await getResponseProfile(currentToken);
        const author = profile ? profile.fullName : 'Unknown Author'; 

        const newCommentHtml = getCommentHtml({ 
            author: author,
            content: content,
            createTime: new Date().toISOString(),
            modifiedDate: null, 
            subComments: 0
        });
        commentsContainer.appendChild(newCommentHtml);

        const amountComments = document.getElementsByClassName('amount-comments')[0];
        const currentComments = parseInt(amountComments.textContent) || 0;
        amountComments.textContent = currentComments + 1;
    }
}

