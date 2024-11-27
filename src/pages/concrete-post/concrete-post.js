import { getConcretePostHtml } from '../main/main.js'
import { getInformationConcretePost } from '../main/post/post.js'
import { formatDateTime } from '../../utils/utils.js';

let post = null;
let postHtml = null;
let comments = null;

export async function uploadConcretePostPage(postId) {
    const postContainer = document.getElementById('container-post');
    const commentsContainer = document.getElementById('container-comments');
    const createCommentContainer = document.getElementById('container-create-comments');

    post = await getInformationConcretePost(postId);
    postHtml = await getConcretePostHtml(post);

    postContainer.appendChild(postHtml);

    comments = post.comments;
    comments.forEach(comment => {
        commentsContainer.appendChild(getCommentHtml(comment));
    });

}

function getCommentHtml(comment) {
    let commentHtml = document.createElement('div');
    commentHtml.classList.add('comment');

    const postTextAboutAuthor = document.createElement('p');
    postTextAboutAuthor.classList.add('post-text-about-author');
    postTextAboutAuthor.textContent = comment.author;

    const postContent = document.createElement('p');
    postContent.classList.add('post-comment-content');
    postContent.textContent = comment.content;

    const postDateAnswerContainer = document.createElement('div');
    postDateAnswerContainer.classList.add('container-date-answer');

    const postDate = document.createElement('div');
    postDate.classList.add('post-data');
    postDate.textContent = formatDateTime(comment.createTime);

    const buttonAnswer = document.createElement('a');
    buttonAnswer.classList.add('button-answer');
    buttonAnswer.textContent = 'Ответить';
    buttonAnswer.setAttribute('data-post-id', post.id);

    postDateAnswerContainer.appendChild(postDate);
    postDateAnswerContainer.appendChild(buttonAnswer);

    commentHtml.appendChild(postTextAboutAuthor);
    commentHtml.appendChild(postContent);
    commentHtml.appendChild(postDateAnswerContainer);

    if (comment.subComments > 0) {
        const buttonOpenAnswers = document.createElement('a');
        buttonOpenAnswers.classList.add('button-answer');
        buttonOpenAnswers.textContent = 'Раскрыть ответы';
        buttonOpenAnswers.setAttribute('data-post-id', post.id);
        commentHtml.appendChild(buttonOpenAnswers);
    }
    return commentHtml;
}

