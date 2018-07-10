const postsUrl = 'https://api.myjson.com/bins/152f9j'

const defaultSort = {
    name: 'date',
    desc: true
}

const renderStep = 10;
let allTags = null
let allPosts = null;
let NextPostToRenderIndex = 0;
let postsContainer = document.getElementById('posts-wrp');
let searchInput = document.getElementById('search-input');
let sortByTagsForm = document.getElementById('sort-by-tags-form');
let sortByDateForm = document.getElementById('sort-by-date-form');


window.addEventListener('load', initialize)
window.addEventListener('scroll', handleScroll);
searchInput.addEventListener('input', handleFindPost);
sortByTagsForm.addEventListener('submit', handleSortByTagsFormSubmit);
sortByDateForm.addEventListener('submit', handleSortByDateFormSubmit);
document.getElementById('resetButton').addEventListener('click', resetPageToInitialState)


function handleScroll() {
    let pageHeight = document.documentElement.scrollHeight;
    let clientHeight = document.documentElement.clientHeight;
    let scrollPos = window.pageYOffset

    if (pageHeight - (scrollPos + clientHeight) < 100) {
        renderMorePosts()
    }
}


function initialize() {
    fetch('https://api.myjson.com/bins/152f9j')
        .then(response => {
            response.json().then(dataObj => {
                generateDOMElements(dataObj.data);
                sortPostsbyDefaults();
                renderMorePosts();
                joinAllTagsOfAllPosts(dataObj.data);
                appendTagsToTheDOM();
            })
        })
        .catch(err => {
            console.log(err)
            alert(err)
        })
}

function sortPostsbyDefaults() {
    let sort = JSON.parse(localStorage.getItem('sortType')) || defaultSort

    if (sort.name == 'date') {
        allPosts.sort((post1, post2) => comparePostByDate(post1, post2, sort.desc))
    } else {
        sortPostsByTags(sort.tags)
    }
}


function generateDOMElements(postsData) {
    allPosts = postsData.map((postObj) => {
        return createPostArcticleNode(postObj)
    })
}

function renderMorePosts() {
    from = NextPostToRenderIndex;
    for (let i = from; (i < from + renderStep) && (i < allPosts.length); i++) {
        renderPost(allPosts[i])
        ++NextPostToRenderIndex
    }
}

function renderPost(post) {
    postsContainer.appendChild(post)
}


function createPostArcticleNode(postObj) {
    let article = document.createElement('article');
    article.classList.add('post')

    article.innerHTML = ` 
            <picture> <img src = ${postObj.image} /> </picture>
            <div class = 'post-content'> 
                <h2 class = 'post-title'> ${postObj.title} </h2> 
                <p> ${postObj.description} </p>
                <div class = 'tag-list'>
                    ${generateTagListItemsStringFor(postObj)}
                </div>
                <p>${new Date(postObj.createdAt)}</p>
            </div>
            <button onclick = 'deletePost()'> <i class="fas fa-trash"></i> </button>
        `
    return article;
}

function deletePost() {
    let postToDelete = event.target.parentNode;
    let indexToDelete = allPosts.indexOf(postToDelete);
    postToDelete.remove ? postToDelete.remove() : postToDelete.parentNode.removeChild(postToDelete);
}


function generateTagListItemsStringFor(postObj) {
    let tagsListItemsString = '';

    for (let i = 0; i < postObj.tags.length; i++) {
        tagsListItemsString += `<div class = 'tag-item'>${postObj.tags[i]}</div>`
    }
    return tagsListItemsString
}

function getPostDate(post) {
    return new Date(post.childNodes[3].childNodes[7].innerText)
}

function rerenderPage() {
    postsContainer.innerHTML = ''

    for (let i = 0; i < NextPostToRenderIndex; i++) {
        renderPost(allPosts[i])
    }
}


function handleSortByDateFormSubmit() {
    event.preventDefault();
    let desc = this.descendingChoise.checked

    localStorage.setItem('sortType', JSON.stringify({
        name: 'date',
        desc: desc
    }))

    allPosts.sort((post1, post2) => comparePostByDate(post1, post2, desc))

    rerenderPage();
}

function comparePostByDate(post1, post2, desc = true) {
    let date1 = getPostDate(post1)
    let date2 = getPostDate(post2)
    return (desc ? (date2 - date1) : (date1 - date2))
}

function handleSortByTagsFormSubmit() {
    event.preventDefault();
    let searchTagsArr = []
    let tagsCheckboxes = sortByTagsForm.getElementsByTagName('input')

    for (let i = 0; i < tagsCheckboxes.length; i++) {
        if (tagsCheckboxes[i].checked) {
            searchTagsArr.push(tagsCheckboxes[i].id)
        }
    }

    localStorage.setItem('sortType', JSON.stringify({
        name: 'tags',
        tags: searchTagsArr
    }))

    sortPostsByTags(searchTagsArr);
    rerenderPage();
}

function sortPostsByTags(tags) {
    allPosts.sort((post1, post2) => {
        tags1 = getPostTags(post1)
        tags2 = getPostTags(post2)
        return (intersectionlength(tags2, tags) - intersectionlength(tags1, tags) ||
            comparePostByDate(post1, post2))
    })
}

function getPostTags(post) {
    let result = []
    let postTagList = post.childNodes[3].childNodes[5].children
    for (let i = 0; i < postTagList.length; i++) {
        result.push(postTagList[i].innerText)
    }
    return result
}

function intersectionlength(arr1, arr2) {
    return arr1.reduce((accum, elem) => {
        return arr2.includes(elem) ? ++accum : accum;
    }, 0)
}


function handleFindPost() {
    let searchRegExp = new RegExp(this.value.trim(), 'i');
    let postTitles = document.getElementsByClassName('post-title')
    let posts = document.getElementsByClassName('post')

    for (let i = 0; i < posts.length; i++) {
        if (searchRegExp.test(postTitles[i].innerText)) {
            posts[i].style.display = ''
        } else {
            posts[i].style.display = 'none'
        }
    }
}

function joinAllTagsOfAllPosts(allPostsData) {
    allTags = allPostsData.reduce((tagsAccumulator, post) => {
        post.tags.forEach((tag) => {
            if (!tagsAccumulator.includes(tag)) {
                tagsAccumulator.push(tag)
            }
        })
        return tagsAccumulator
    }, allPostsData[0].tags)
}

function appendTagsToTheDOM() {
    let list = document.getElementById('tag-list-for-sort-choise')
    allTags.forEach((tagName) => {
        let input = Object.assign(document.createElement('input'), {
            type: 'checkbox',
            name: tagName,
            id: tagName
        })
        let label = document.createElement('label')
        label.setAttribute('for', tagName)
        label.innerText = tagName;

        list.insertBefore(label, list.firstChild);
        list.insertBefore(input, list.firstChild);
    })

}

function resetPageToInitialState() {
    event.preventDefault();
    postsContainer.innerHTML = ''
    document.body.scrollTop = 0
    NextPostToRenderIndex = 0;
    renderMorePosts();
}