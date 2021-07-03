const dummy = (blogs) => {
    return 1;
}

const totalLikes = (blogs) => {
    //0 is the initial value of acc
    let result = blogs.reduce((acc, obj) => { return acc + obj.likes }, 0);
    //console.log(result);
    return result;
}

const favorite = (blogs) => {
    const max = blogs.reduce((previous, current) => {
        return (previous.likes > current.likes) ? previous : current
    }, 0)
    //console.log('Max', max);
    const favoriteBlog = {
        title: max.title,
        author: max.author,
        likes: max.likes
    }

    return favoriteBlog;
}

module.exports = {
    dummy, totalLikes, favorite
}