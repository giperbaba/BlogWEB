import { getConcretePostHtml } from '../main/main.js'
import { formatDateTime } from '../../utils/utils.js';

import { getInformationConcretePost } from '../main/post/post.js'

import { requestAddComment, requestEditComment } from './comment/comment.js';
import { requestGetAllReplies } from './comment/comment.js';

import { getResponseProfile } from '../profile/profile.js';

import { requestDeleteComment } from './comment/comment.js';

import { navigate } from '../general/general.js';

let post = null;
let postHtml = null;
let comments = null;

export async function uploadConcretePostPage(postId) {
    const postContainer = document.getElementById('container-post');
    const commentsContainer = document.getElementById('container-comments');

    post = await getInformationConcretePost(postId);
    postHtml = await getConcretePostHtml(post, true);

    postContainer.appendChild(postHtml);

    comments = post.comments;
    comments.forEach(async comment => {
        commentsContainer.appendChild(await getCommentHtml(comment));
    });


    const buttonSendComment = document.getElementById('button-send-comment');
    buttonSendComment.setAttribute('data-post-id', post.id);
}

async function getCommentHtml(comment, isReply = false) {
    let commentHtml = document.createElement('div');
    commentHtml.classList.add('comment');
    commentHtml.id = comment.id;

    const textAboutAuthor = document.createElement('p');
    textAboutAuthor.classList.add('post-text-about-author');
    textAboutAuthor.textContent = comment.author;

    const commentContent = document.createElement('p');
    commentContent.classList.add('post-comment-content');

    const postDate = document.createElement('div');
    postDate.classList.add('post-data');

    if (comment.deleteDate) {
        textAboutAuthor.textContent = '[Комментарий удален]';
        textAboutAuthor.style.color = 'gray';
        commentContent.textContent = '[Комментарий удален]';
        commentContent.style.color = 'gray';
        postDate.textContent = formatDateTime(comment.deleteDate);

        commentHtml.appendChild(textAboutAuthor);
        commentHtml.appendChild(commentContent);
        commentHtml.appendChild(postDate);
    }
    else {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
            const profile = await getResponseProfile(currentToken);
            if (comment.authorId === profile.id) {
                const authorEditDeleteCommentContainer = document.createElement('div');
                authorEditDeleteCommentContainer.classList.add('author-with-buttons');

                const editIcon = document.createElement('img');
                editIcon.src = '/src/drawable/icon-edit.png';
                editIcon.classList.add('icon');
                editIcon.setAttribute('data-comment-id', comment.id);
                editIcon.id = 'button-edit-comment';

                const deleteIcon = document.createElement('img');
                deleteIcon.src = '/src/drawable/icon-delete.png';
                deleteIcon.classList.add('icon');
                deleteIcon.setAttribute('data-comment-id', comment.id);
                deleteIcon.setAttribute('data-post-id', post.id);
                deleteIcon.id = 'button-delete-comment';

                authorEditDeleteCommentContainer.appendChild(textAboutAuthor);
                authorEditDeleteCommentContainer.appendChild(editIcon);
                authorEditDeleteCommentContainer.appendChild(deleteIcon);

                commentHtml.appendChild(authorEditDeleteCommentContainer);
            }
            else {
                commentHtml.appendChild(textAboutAuthor);
            }
        }
        else {
            commentHtml.appendChild(textAboutAuthor);
        }

        const commentContentModifiedContainer = document.createElement('div');
        commentContentModifiedContainer.classList.add('container-content-modified');

        commentContent.textContent = comment.content;

        commentContentModifiedContainer.appendChild(commentContent);

        if (comment.modifiedDate) {
            const isModified = document.createElement('p');
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

        postDate.textContent = formatDateTime(comment.createTime);

        const buttonAnswer = document.createElement('a');
        buttonAnswer.classList.add('button-answer');
        buttonAnswer.id = 'button-answer';
        buttonAnswer.textContent = 'Ответить';
        buttonAnswer.setAttribute('data-post-id', post.id);
        buttonAnswer.setAttribute('data-comment-id', comment.id);

        commentDateAnswerContainer.appendChild(postDate);
        commentDateAnswerContainer.appendChild(buttonAnswer);

        commentHtml.appendChild(commentContentModifiedContainer);
        commentHtml.appendChild(commentDateAnswerContainer);
    }
    if (comment.subComments > 0 && !isReply) {
            const buttonOpenAnswers = document.createElement('a');
            buttonOpenAnswers.classList.add('button-answer');
            buttonOpenAnswers.id = 'button-open-answer';
            buttonOpenAnswers.textContent = 'Раскрыть ответы';
            buttonOpenAnswers.setAttribute('data-post-id', post.id);
            buttonOpenAnswers.setAttribute('data-comment-id', comment.id);
            commentHtml.appendChild(buttonOpenAnswers);
        }
    return commentHtml;
}

export async function sendComment(postId, content, parentId = null, answer = false) {
    const currentToken = localStorage.getItem('token');

    const commentData = { content, parentId };
    const success = await requestAddComment(postId, commentData);

    if (success) {
        const inputElement = document.getElementById('input-create-comment');
        if (inputElement) {
            inputElement.value = '';
        }

        if (parentId) {
            const answerForm = document.querySelector(`.container-answer-comment[parent-id="${parentId}"]`);
            if (answerForm) {
                answerForm.remove();
            }
            
        }

        reloadAllComments(postId);
    }
}

export async function editComment(id, content, postId) {
    const success = await requestEditComment(id, content);

    if (success) {
        reloadAllComments(postId);
    }
}

export async function openReplies(commentId) {
    const replies = await requestGetAllReplies(commentId);
    const currentComment = document.getElementById(commentId);

    const buttonOpenAnswers = currentComment.querySelector('#button-open-answer');
    if (buttonOpenAnswers) {
        buttonOpenAnswers.remove();
    }

    let replyContainer = currentComment.querySelector('.container-reply');
    if (replyContainer) {
        replyContainer.innerHTML = '';
    } else {
        replyContainer = document.createElement('div');
        replyContainer.classList.add('container-reply');
    }

    replies.forEach(async reply => {
        const replyHtml = await getCommentHtml(reply, true);
        replyContainer.appendChild(replyHtml);
    });

    currentComment.appendChild(replyContainer);
}


export function showInputAnswer(parentId) {
    const currentComment = document.getElementById(parentId);

    const existingAnswerInput = currentComment.querySelector('.container-handle-comment');
    if (existingAnswerInput) {
        return;
    }

    const answerHtml = document.createElement('div');
    answerHtml.classList.add('container-handle-comment');
    answerHtml.setAttribute('parent-id', parentId);

    const inputAnswer = document.createElement('input');
    inputAnswer.type = 'text';
    inputAnswer.classList.add('input-comment');
    inputAnswer.id = 'input-answer';
    inputAnswer.placeholder = 'Оставьте комментарий...';

    const buttonSendAnswer = document.createElement('button');
    buttonSendAnswer.classList.add('button');
    buttonSendAnswer.setAttribute('parent-id', parentId);
    buttonSendAnswer.setAttribute('data-post-id', post.id);
    buttonSendAnswer.id = 'button-send-answer';
    buttonSendAnswer.textContent = 'Отправить';

    answerHtml.appendChild(inputAnswer);
    answerHtml.appendChild(buttonSendAnswer);
    
    const error = document.createElement('p');
    error.id = 'error';
    answerHtml.appendChild(error);

    currentComment.appendChild(answerHtml);
}

export function showInputEditComment(id) {
    const currentComment = document.getElementById(id);

    const existingEditInput = currentComment.querySelector('.container-handle-comment');
    if (existingEditInput) {
        return;
    }

    const commentContent = currentComment.querySelector('.post-comment-content');
    const isModified = currentComment.querySelector('.is-modified');
    if (commentContent) {
        commentContent.style.display = 'none'; 

        if (isModified) {
            isModified.style.display = 'none';
        }
    }

    const editHtml = document.createElement('div');
    editHtml.classList.add('container-handle-comment');
    editHtml.setAttribute('id-comment', id);

    const inputEdit = document.createElement('input');
    inputEdit.type = 'text';
    inputEdit.classList.add('input-comment');
    inputEdit.id = 'input-edit';
    inputEdit.value = commentContent ? commentContent.textContent : '';

    const buttonSendEdit = document.createElement('button');
    buttonSendEdit.classList.add('button');
    buttonSendEdit.setAttribute('data-comment-id', id);
    buttonSendEdit.setAttribute('data-post-id', post.id);
    buttonSendEdit.id = 'button-send-edit';
    buttonSendEdit.textContent = 'Редактировать';

    const error = document.createElement('p');
    error.id = 'error';

    editHtml.appendChild(inputEdit);
    editHtml.appendChild(buttonSendEdit);
    editHtml.appendChild(error);

    if (commentContent) {
        commentContent.parentNode.insertBefore(editHtml, commentContent);
    }
}

export async function reloadAllComments(postId) {

    const errorElement = document.getElementById('error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
    
    const commentsContainer = document.getElementById('container-comments');

    const post = await getInformationConcretePost(postId);
    const comments = post.comments;

    const headerComments = document.createElement('h3');
    headerComments.id = 'text-header-comments';
    headerComments.textContent = 'Комментарии';
    commentsContainer.innerHTML = '';
    commentsContainer.appendChild(headerComments);

    for (const comment of comments) {
        const commentHtml = await getCommentHtml(comment);
        commentsContainer.appendChild(commentHtml);
    }

    const amountComments = document.getElementsByClassName('amount-comments')[0];
    const currentComments = parseInt(amountComments.textContent) || 0;
    amountComments.textContent = currentComments + comments.length;
}

export async function deleteComment(id, postId) {
    const success = await requestDeleteComment(id);

    if (success) {
        reloadAllComments(postId);
    }
}