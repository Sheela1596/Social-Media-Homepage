import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './socialmediahomepage.css';
import { FaRegHeart } from 'react-icons/fa';

function SocialMediaHomePage() {

  const [posts, setPosts] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsVisible, setCommentsVisible] = useState({});

  useEffect(() => {
    axios.get('./username.json')
      .then(response => {
        setUsersData(response.data);
        setIsLoading(false); 
      })
      .catch(error => {
        console.error('Error fetching user data:', error);
        setIsLoading(false); 
      });

    axios.get('https://jsonplaceholder.typicode.com/posts')
      .then(response => {
        const fetchedPosts = response.data;
        const postsWithComments = fetchedPosts.map(post => {
          return axios.get(`https://jsonplaceholder.typicode.com/comments?postId=${post.id}`)
            .then(response => {
              post.comments = response.data;
              return post;
            });
        });
        Promise.all(postsWithComments)
          .then(updatedPosts => {
            setPosts(updatedPosts);
            const initialCommentsVisibleState = updatedPosts.reduce((acc, post) => {
              acc[post.id] = false;
              return acc;
            }, {});
            setCommentsVisible(initialCommentsVisibleState);
          });
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  }, []);

  const getUserName =  id=> {
    const user = usersData.find(user => user.userId === String(id));
    if (!user) {
      console.log(`User with userId ${id} not found.`);
    }
    return user ? user.name : 'Unknown User';
  };
  
  
  const getUserAvatarUrl = userId => {
    return `https://picsum.photos/50?random=${userId}&seed=${Math.random()}`;
  };

  const toggleCommentsVisibility = postId => {
    setCommentsVisible(prevState => ({
      ...prevState,
      [postId]: !prevState[postId]
    }));
  };

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className="social-media-homepage">
      <h1>Social Media Homepage</h1>
      <div className="posts">
        {posts.map(post => (
          <div key={post.id} className="post">
              <div className="post-content">
                <h2>{post.title}</h2>
                <p>{post.body}</p>
              </div> 
              <button className="comment-button" onClick={() => toggleCommentsVisibility(post.id)}>
                {commentsVisible[post.id] ? "Hide Comments" : "Show Comments"}
              </button>
              {commentsVisible[post.id] && (
                <ul className="comments">
                  {post.comments.map(comment => (
                    <li key={comment.id} className="comment">
                      <img src={getUserAvatarUrl(comment.id)} alt="User Avatar" />
                      <div className="comment-content">
                        <strong>{getUserName(comment.id)}</strong>: {comment.body}
                        <FaRegHeart className="heart-icon" size={24} color="black" />
                        <span className="reply-text">Reply</span> 
                      </div>
                    </li>
                  ))}
                </ul>
              )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialMediaHomePage;
