class Posts {
    constructor(postsUrl , renderStep = 9){
        this.postsUrl = postsUrl
        this.allPosts = null;
        this.fetchPost(this.postsUrl)
        this.lastPostIndexToRender = renderStep;
        console.log(this.allPosts)
    }

    fetchPost(){
        fetch('https://api.myjson.com/bins/152f9j')
            .then(response => {
                response.json().then(dataObj =>{
                    this.allPosts = dataObj.data;

                    this.allPosts.forEach( post =>{
                        post.createdAt = new Date(post.createdAt)
                    })
                    for( let i = 0; i< 10; i++){
                        this.createPost(this.allPosts[i])
                    }
                    
                    console.log( this.allPosts[0])
                })
            })
            .catch(err =>{
                console.log(err)
                alert(err)
            })
    }

    createPost(postObj = this.allPosts[2]){
       let article = document.createElement('article'); 
       article.classList.add('post')

       article.innerHTML = ` 
            <picture> <img src = ${postObj.image} /> </picture>
            <div class = 'post-content'> 
                <h2>${postObj.title}</h2> 
                <p> ${postObj.description} </p>
                <div class = 'tag-list'>
                    ${this.generateTagListItemsStringFor(postObj)}
                </div>
                <p> ${postObj.createdAt} </p>
            </div>
       `
       document.body.appendChild(article);
    }

    generateTagListItemsStringFor(postObj){
      let tagsListItemsString = '';

       for (let i = 0; i< postObj.tags.length; i++){
            tagsListItemsString += `<div class = 'tag-item'>${postObj.tags[i]}</div>`
       }
       return tagsListItemsString
    }
}