import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './socialmediahomepage.css';

function SocialMediaHomePage() {
  
  const [posts, setPosts] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
          });
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  }, []);

  const getUserName =  id=> {
    console.log('userId:', id);
    console.log('usersData:', usersData);
    const user = usersData.find(user => user.userId === String(id));
    console.log('Found user:', user);
    if (!user) {
      console.log(`User with userId ${id} not found.`);
    }
    return user ? user.name : 'Unknown User';
  };
  
  
  const getUserAvatarUrl = userId => {
    console.log('imageuserid=',userId);
    return `https://picsum.photos/50?random=${userId}&seed=${Math.random()}`;
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
              <ul className="comments">
                {post.comments.map(comment => {
                  console.log('Comment:', comment);
                  return (
                    <li key={comment.id} className="comment">
                      <img src={getUserAvatarUrl(comment.id)} alt="User Avatar" />
                      <div className="comment-content">
                        <strong>{getUserName(comment.id)}</strong>: {comment.body}
                      </div>
                    </li>
                  );
                })}
              </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SocialMediaHomePage;
